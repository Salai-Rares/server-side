import { id, inject, injectable } from "inversify";
import { IProductCreateService } from "../types";
import { IProductRepositoryWrite } from "../types/create/product-write.repository.types";
import { TYPES } from "@/shared/types";

import { newHexStringId } from "@/shared/utils";
import { ProductDtoToEntityMapper } from "../mappers/domain/dto-to-entity.mapper";
import { ProductProps } from "../domain/product.types";
import { ProductVariantEntity } from "../domain/variant-product.entity";
import { ProductVariantMapper } from "../mappers/domain/variant/variantDto-to-entity.mapper";
import { InventoryEntity } from "@/modules/inventory/domain/inventory.entity";
import { ProductEntity } from "../domain/product.entity";
import slugify from "slugify";
import { SlugVO } from "../domain/value-objects/slug.value-object";

import mongoose from "mongoose";
import { MongoServerError } from "mongodb";
import { withRetry } from "@/shared/utils/retry";
import { ApiError } from "@/shared/errors/api-error/ApiError";
import { ILogger } from "@/core/logger/logger.interface";
import { CreateProductType } from "../schemas";
import { CreateInventoryType } from "@/modules/inventory/schemas/create-inventory.dto";
import { IInventoryServiceCreate } from "@/modules/inventory/types/create/inventory-create.service.types";
import { ImageVO } from "../domain/value-objects/image.value-object";

@injectable()
export class ProductCreateUseCase implements IProductCreateService {
  constructor(
    @inject(TYPES.ProductWriteRepository)
    private productRepository: IProductRepositoryWrite,
    @inject(TYPES.InventoryCreateUseCase)
    private inventoryService: IInventoryServiceCreate,
    @inject(TYPES.Logger) private logger: ILogger
  ) {}

  /**
   * @description Create product along the inventory if provided. If the product has variants create also the inventories for each of them if existing.
   * @responsability The create method has the responsability to validate the invariants that the product entity can't
   * @throws Error if the product has variants and also a root inventory
   * @throws Error if the name already exists
   *
   */
  async createProductWithInventories(
    dto: CreateProductType
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

        //2. Process root images
        let images: ImageVO[] | undefined;
        if (images && images.length > 0) {
          images = dto.images?.map((image) => {
            const id = newHexStringId();
            return {
              id,
              ...image,
            };
          });
        }

        // 2. Process variants and prepare inventory requests
        let variants: ProductVariantEntity[] | undefined;
        let inventoryRequests: CreateInventoryType[] = [];

        if (hasVariants && dto.variants) {
          variants = dto.variants.map((v) => {
            let variantImages: ImageVO[] | undefined;
            const variantId = newHexStringId();

            // Add inventory request for variant if provided
            if (v.inventory) {
              inventoryRequests.push({
                referenceRootId: productId,
                referenceVariantId: variantId,
                stock: v.inventory.stock,
                warehouseLocation: v.inventory.warehouseLocation,
              });
            }

            variantImages = v.images?.map((image) => ({
              id: newHexStringId(),
              ...image,
            }));

            return new ProductVariantEntity({
              id: variantId,
              images: variantImages,
              ...ProductVariantMapper.toDomain(
                ProductVariantMapper.extractBaseProperties(v)
              ),
            });
          });
        } else if (dto.inventory) {
          // Add inventory request for root product
          inventoryRequests.push({
            referenceRootId: productId,
            stock: dto.inventory.stock,
            warehouseLocation: dto.inventory.warehouseLocation,
          });
        }

        // 3. Create and save product
        const product = new ProductEntity({
          id: productId,
          ...ProductDtoToEntityMapper.mapToEntity(dto),
          images,
          slug: SlugVO.fromName(dto.name),
          variants,
        });

        const savedProduct = await this.productRepository.saveProduct(product, {
          session,
        });

        // 4. Save inventories using the service
        let savedInventories: InventoryEntity[] | undefined;
        if (inventoryRequests.length > 0) {
          savedInventories =
            inventoryRequests.length === 1
              ? [
                  await this.inventoryService.saveInventory(
                    inventoryRequests[0],
                    { session }
                  ),
                ]
              : await this.inventoryService.saveBulkInventories(
                  inventoryRequests,
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
