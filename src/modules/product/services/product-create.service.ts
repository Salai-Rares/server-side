import { inject, injectable } from "inversify";
import { IProductCreateService } from "../types";
import { IProductRepositoryWrite } from "../types/create/product-write.repository.types";
import { TYPES } from "@/shared/types";

import { ProductDtoToEntityMapper } from "../mappers/domain/dto-to-entity.mapper";
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
import { ProductVariantUniquenessValidator } from "../validators/product-variant-uniqueness.validator";
import { IIdGenerator } from "@/core/application/ports/id/id-generator.interface";

@injectable()
export class ProductCreateUseCase implements IProductCreateService {
  constructor(
    @inject(TYPES.ProductWriteRepository)
    private productRepository: IProductRepositoryWrite,
    @inject(TYPES.InventoryCreateUseCase)
    private inventoryService: IInventoryServiceCreate,
    @inject(TYPES.Logger) private logger: ILogger,
    @inject(TYPES.ProductVariantUniquenessValidator)
    private variantValidator: ProductVariantUniquenessValidator,
    @inject(TYPES.IdGenerator)
    private idGenerator: IIdGenerator
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
        const productId = this.idGenerator.generate();
        const hasVariants = Boolean(dto.variants?.length);

        if (hasVariants && dto.inventory) {
          throw ApiError.businessRuleViolation(
            "Root product cannot have both variants and inventory",
            "product has either variants with possible inventories either only inventory"
          );
        }

        // 2. Process root images
        let images: ImageVO[] | undefined;
        images = dto.images?.map((image) => {
          const id = this.idGenerator.generate();
          return { id, ...image };
        });

        // 3. Process variants and prepare inventory requests
        let variants: ProductVariantEntity[] | undefined;
        let inventoryRequests: CreateInventoryType[] = [];

        if (hasVariants && dto.variants) {
          variants = dto.variants.map((v) => {
            let variantImages: ImageVO[] | undefined;
            const variantId = this.idGenerator.generate();

            if (v.inventory) {
              inventoryRequests.push({
                referenceRootId: productId,
                referenceVariantId: variantId,
                stock: v.inventory.stock,
                warehouseLocation: v.inventory.warehouseLocation,
              });
            }

            variantImages = v.images?.map((image) => ({
              id: this.idGenerator.generate(),
              ...image,
            }));

            return new ProductVariantEntity({
              id: variantId,
              images: variantImages,
              slug: SlugVO.fromName(v.name),
              ...ProductVariantMapper.toDomain(
                ProductVariantMapper.extractBaseProperties(v)
              ),
            });
          });
        } else if (dto.inventory) {
          inventoryRequests.push({
            referenceRootId: productId,
            stock: dto.inventory.stock,
            warehouseLocation: dto.inventory.warehouseLocation,
          });
        }

        // 4. Create and save product
        const product = new ProductEntity({
          id: productId,
          ...ProductDtoToEntityMapper.mapToEntity(dto),
          images,
          slug: SlugVO.fromName(dto.name),
          variants,
        });

        await this.variantValidator.validate(product, { session });
        const savedProduct = await this.productRepository.saveProduct(product, {
          session,
        });

        // 5. Save inventories
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

        result = { product: savedProduct, inventories: savedInventories };
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
