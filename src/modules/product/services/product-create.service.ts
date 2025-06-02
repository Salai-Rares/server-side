import { id, inject, injectable } from "inversify";
import { IProductCreateService } from "../types";
import { IProductRepository } from "../types/product.repository.types";
import { TYPES } from "@/shared/types";
import { CreateProductDto } from "../schemas";
import { newHexStringId } from "@/shared/utils";
import { ProductDtoToEntityMapper } from "../mappers/domain/dto-to-entity.mapper";
import { ProductProps } from "../domain/product.types";
import { ProductVariantEntity } from "../domain/variant-product.entity";
import { ProductVariantMapper } from "../mappers/domain/variantDto-to-entity.mapper";
import { InventoryEntity } from "@/modules/inventory/domain/inventory.entity";
import { ProductEntity } from "../domain/product.entity";
import slugify from "slugify";
import { SlugVO } from "../domain/value-objects/slug.value-object";
import { IInventoryRepository } from "@/modules/inventory/types";
import mongoose from "mongoose";
import { MongoServerError } from "mongodb";
import { withRetry } from "@/shared/utils/retry";
import { ApiError } from "@/shared/errors/api-error/ApiError";
import { ILogger } from "@/core/logger/logger.interface";
@injectable()
export class ProductCreateUseCase implements IProductCreateService {
  constructor(
    @inject(TYPES.ProductRepository)
    private productRepository: IProductRepository,
    @inject(TYPES.InventoryRepository)
    private inventoryRepository: IInventoryRepository,
    @inject(TYPES.Logger) private logger: ILogger
  ) {}

  /**
   * @description Create product along the inventory if provided. If the product has variants create also the invenotories for each of them if existing.
   * @responsability The create method has the responsability to validate the invariants that the product entity can't
   * @throws Error if the product has variants and also a root inventory
   * @throws Error if the name already exists
   *
   */
  async createProductWithInventories(
    dto: CreateProductDto
  ): Promise<{ product: ProductEntity; inventories?: InventoryEntity[] }> {
    const session = await mongoose.startSession();
    let result:
      | { product: ProductEntity; inventories?: InventoryEntity[] }
      | undefined;

    try {
      await session.withTransaction(async () => {
        // 1. Prepare IDs and validate
        const productId = newHexStringId();
        const hasVariants = Boolean(dto.variants?.length);

        if (hasVariants && dto.inventory) {
          throw ApiError.businessRuleViolation(
            "Root product cannot have both variants and inventory",
            "product has either variants with possible inventories either only inventory"
          );
        }

        // 2. Process variants
        let variants: ProductVariantEntity[] | undefined;
        let inventoriesToSave: InventoryEntity[] = [];

        if (hasVariants && dto.variants) {
          variants = dto.variants.map((v) => {
            const variantId = newHexStringId();

            if (v.inventory) {
              inventoriesToSave.push(
                new InventoryEntity({
                  id: newHexStringId(),
                  referenceType: "variant",
                  referenceId: variantId,
                  ...v.inventory,
                })
              );
            }

            return new ProductVariantEntity({
              id: variantId,
              ...ProductVariantMapper.toDomain(
                ProductVariantMapper.extractBaseProperties(v)
              ),
            });
          });
        } else if (dto.inventory) {
          inventoriesToSave.push(
            new InventoryEntity({
              id: newHexStringId(),
              referenceType: "product",
              referenceId: productId,
              ...dto.inventory,
            })
          );
        }

        // 3. Create and save product
        const product = new ProductEntity({
          id: productId,
          hasVariants,
          ...ProductDtoToEntityMapper.mapToEntity(dto),
          slug: SlugVO.fromName(dto.name),
          variants,
        });

        const savedProduct = await this.productRepository.saveProduct(product, {
          session,
        });

        // 4. Save inventories
        let savedInventories: InventoryEntity[] | undefined;
        if (inventoriesToSave.length) {
          savedInventories =
            inventoriesToSave.length === 1
              ? [
                  await this.inventoryRepository.saveInventory(
                    inventoriesToSave[0],
                    { session }
                  ),
                ]
              : await this.inventoryRepository.saveBulkInventories(
                  inventoriesToSave,
                  { session }
                );
        }

        // Store result outside the transaction
        result = {
          product: savedProduct,
          inventories: savedInventories,
        };
      });

      if (!result) {
        throw ApiError.internalError(
          "Transaction completed but returned no result",
          new Error("Transaction result is undefined")
        );
      }

      return result;
    } finally {
      try {
        await session.endSession();
      } catch (cleanupError) {
        // Use your logger service
        this.logger.warn("Failed to close MongoDB session", {
          error:
            cleanupError instanceof Error ? cleanupError.message : cleanupError,
          stack: cleanupError instanceof Error ? cleanupError.stack : undefined,
          operation: "product_creation",
          sessionId: session.id,
        });
      }
    }
  }
}
