import { inject, injectable } from "inversify";

import { TYPES } from "@/shared/types";



import { ProductVariantEntity } from "../domain/variant-product.entity";
import { ProductVariantMapper } from "../mappers/domain/variant/variantDto-to-entity.mapper";
import { InventoryEntity } from "@/modules/inventory/domain/inventory.entity";
import { ProductEntity } from "../domain/product.entity";

import { ApiError } from "@/shared/errors/api-error/ApiError";
import { ILogger } from "@/core/logger/logger.interface";

import { IProductUpdateService } from "../types/update/product-update.service.types";
import { ProductUpdateCommand } from "./commands/product-update.command";
import { IProductReadService } from "../types/read/read-product.service.types";
import { ImageVO } from "../domain/value-objects/image.value-object";
import { IInventoryServiceDelete } from "@/modules/inventory/types/delete/inventory-delete.service.types";
import { IInventoryServiceUpdate } from "@/modules/inventory/types/update/inventory-update.service.types";
import { IInventoryServiceCreate } from "@/modules/inventory/types/create/inventory-create.service.types";

import { CreateInventoryType } from "@/modules/inventory/schemas/create-inventory.dto";
import { IProductRepositoryUpdate } from "../types/update/product-update.repository.types";
import mongoose from "mongoose";
import { IInventoryServiceRead } from "@/modules/inventory/types";
import { SlugVO } from "../domain/value-objects/slug.value-object";
import { IIdGenerator } from "@/core/application/ports/id/id-generator.interface";
@injectable()
export class ProductUpdateUseCase implements IProductUpdateService {
  constructor(
    @inject(TYPES.ProductReadUseCase)
    private productReadService: IProductReadService,
    @inject(TYPES.InventoryDeleteUseCase)
    private inventoryDeleteUseCase: IInventoryServiceDelete,
    @inject(TYPES.InventoryUpdateUseCase)
    private inventoryUpdateUseCase: IInventoryServiceUpdate,
    @inject(TYPES.InventoryCreateUseCase)
    private inventoryCreateUseCase: IInventoryServiceCreate,
    @inject(TYPES.ProductRepositoryUpdate)
    private productRepositoryUpdate: IProductRepositoryUpdate,
    @inject(TYPES.InventoryReadUseCase)
    private inventoryReadUseCase: IInventoryServiceRead,
    @inject(TYPES.Logger) private logger: ILogger,
    @inject(TYPES.IdGenerator) private idGenerator : IIdGenerator
  ) {}
  async updateProductWithInventories(
    command: ProductUpdateCommand
  ): Promise<{ product: ProductEntity; inventories: InventoryEntity[] }> {
    const session = await mongoose.startSession();
    let result:
      | { product: ProductEntity; inventories: InventoryEntity[] }
      | undefined;

    try {
      await session.withTransaction(async () => {
        const product: ProductEntity | null =
          await this.productReadService.findProductById(command.productId, {
            session,
          });
        const rootInventoryRequest = command.inventory;
        const variantOperationsRequest = command.variantOperations;
        if (rootInventoryRequest) {
          if (rootInventoryRequest.remove && rootInventoryRequest.update) {
            throw ApiError.badRequest(
              "Can't remove the root and update it in the same operation"
            );
          }

          if (rootInventoryRequest.update && rootInventoryRequest.create) {
            throw ApiError.badRequest(
              "Can't create a new root and update a existing one in the same operation"
            );
          }

          if (variantOperationsRequest) {
            if (
              (rootInventoryRequest.create || rootInventoryRequest.update) &&
              (variantOperationsRequest.add || variantOperationsRequest.update)
            ) {
              throw ApiError.badRequest(
                "Can't create or update the root inventory while doing creation or updates on variants"
              );
            }
          }
        }
        if (!product) {
          throw ApiError.notFound(
            "Requested product does not exist",
            command.productId
          );
        }

        if (command.productDomain) {
          product.updateMultiple(command.productDomain);
        }
        const rootImageOperations = command.imageOperations;
        //Process all the root image operations
        if (rootImageOperations) {
          const { add, remove, order } = rootImageOperations;
          // Check operations exist first
          const hasOperations = remove?.length || add?.length;
          if (hasOperations && !order) {
            throw ApiError.badRequest(
              "Order needs to exist if operations are made on the root images"
            );
          }
          if (hasOperations && order) {
            if (remove?.length) {
              product.removeImages(remove);
            }
            if (add?.length) {
              for (const img of add) {
                const mongoImageId = this.idGenerator.generate();
                const imageToPush: ImageVO = {
                  id: mongoImageId,
                  url: img.url,
                  alt: img.alt,
                };
                const indexOfTempID = order.indexOf(img.tempId);
                if (indexOfTempID !== -1) {
                  order[indexOfTempID] = mongoImageId;
                }
                product.addImage(imageToPush);
              }
            }
            product.reorderImages(order);
          }
        }

        //process inventory operations
        if (rootInventoryRequest) {
          if (rootInventoryRequest.remove) {
            await this.inventoryDeleteUseCase.deleteInventoryPermanentById(
              rootInventoryRequest.remove,
              command.productId,
              { session }
            );
          }
          if (rootInventoryRequest.update) {
            const { id, stock, warehouseLocation } =
              rootInventoryRequest.update;
            await this.inventoryUpdateUseCase.updateInventory(
              id,
              {
                stock,
                warehouseLocation,
              },
              { session }
            );
          }
          if (rootInventoryRequest.create) {
            const { stock, warehouseLocation } = rootInventoryRequest.create;
            const inventoryCreate: CreateInventoryType = {
              stock,
              warehouseLocation,
              referenceRootId: command.productId,
            };
            await this.inventoryCreateUseCase.saveInventory(inventoryCreate, {
              session,
            });
          }
        }

        if (variantOperationsRequest) {
          //remove variants
          if (variantOperationsRequest.remove) {
            await this.inventoryDeleteUseCase.deleteManyVariantInventoriesPermanent(
              command.productId,
              variantOperationsRequest.remove,
              { session }
            );
            product.removeVariants(variantOperationsRequest.remove);
          }
          //add variants
          if (variantOperationsRequest.add) {
            for (const variantToAdd of variantOperationsRequest.add) {
              const {
                sku,
                productOptions,
                price,
                images,
                inventory,
          
                name,
              } = variantToAdd;
              const dtoForMapping = { sku, productOptions, price, name };
              const resulDto = ProductVariantMapper.toDomain(dtoForMapping);
              const arrayOfImageVO: ImageVO[] | undefined = images?.map(
                (img) => ({
                  id: this.idGenerator.generate(),
                  ...img,
                })
              );
              const variantId = this.idGenerator.generate();
              const variantEntity: ProductVariantEntity =
                new ProductVariantEntity({
                  id: variantId,
                  slug: SlugVO.fromName(name),
                  ...resulDto,
                  images: arrayOfImageVO,
                });
              product.addVariant(variantEntity);
              if (inventory) {
                const inventoryDto: CreateInventoryType = {
                  referenceRootId: command.productId,
                  referenceVariantId: variantId,
                  ...inventory,
                };
                await this.inventoryCreateUseCase.saveInventoryForKnownProduct(
                  product,
                  inventoryDto,
                  { session }
                );
              }
            }
          }
          //update existing variants
          if (variantOperationsRequest.update) {
            for (const variant of variantOperationsRequest.update) {
              let imagesOperation:
                | { add?: ImageVO[]; remove?: string[]; order: string[] }
                | undefined;
              if (variant.images) {
                imagesOperation = { order: [] };

                const { add = [], remove = [], order = [] } = variant.images;

                const hasAdd = add.length > 0;
                const hasOrder = order.length > 0;

                if (hasAdd && !hasOrder) {
                  throw ApiError.badRequest(
                    "Order needs to exist if images are added"
                  );
                }
                const finalImageCount =
                  product.getVariantById(variant.id).getImagesLength() +
                  add.length -
                  remove.length;
                if (finalImageCount > 0 && !hasOrder) {
                  throw ApiError.badRequest(
                    "You did operations on the images but didn't provide a order"
                  );
                }

                if (remove.length) {
                  imagesOperation.remove = [...remove];
                }

                if (add.length) {
                  imagesOperation.add = [];
                  for (const img of add) {
                    const id = this.idGenerator.generate();
                    imagesOperation.add.push({
                      id,
                      url: img.url,
                      alt: img.alt,
                    });

                    const indexOfTempID = order.indexOf(img.tempId);
                    if (indexOfTempID !== -1) {
                      order[indexOfTempID] = id;
                    } else {
                      throw ApiError.badRequest(
                        "Could not find the temp id inside the order array"
                      );
                    }
                  }
                }

                imagesOperation.order.push(...order);
              }
              product.updateVariant(
                {
                  id: variant.id,
                  productOptions: variant.productOptions,
                  price: variant.price,
                },
                imagesOperation
              );

              //inventory variant handle
              if (variant.inventory) {
                const { create, update, remove } = variant.inventory;
                if (remove) {
                  await this.inventoryDeleteUseCase.deleteInventoryPermanentById(
                    remove,
                    command.productId,
                    { session }
                  );
                }
                if (update) {
                  const { id, stock, warehouseLocation } = update;
                  await this.inventoryUpdateUseCase.updateInventory(
                    id,
                    {
                      stock,
                      warehouseLocation,
                    },
                    { session }
                  );
                }
                if (create) {
                  const { stock, warehouseLocation } = create;
                  const inventoryCreate: CreateInventoryType = {
                    stock,
                    warehouseLocation,
                    referenceRootId: command.productId,
                    referenceVariantId: variant.id,
                  };
                  await this.inventoryCreateUseCase.saveInventory(
                    inventoryCreate,
                    { session }
                  );
                }
              }
            }
          }
        }
        const [updatedProduct, existingInventories] = await Promise.all([
          this.productRepositoryUpdate.updateProduct(product, { session }),
          this.inventoryReadUseCase.findInventoriesByProductId(product.id, {
            session,
          }),
        ]);
        result = { product: updatedProduct, inventories: existingInventories };
      });
      if (!result) {
        throw ApiError.internalError(
          "Transaction finished but returned no result"
        );
      }
      return result;
    } finally {
      try {
        await session.endSession();
      } catch (err) {
        this.logger.warn(
          "Failed to close MongoDB session after product update",
          {
            error: err instanceof Error ? err.message : err,
            stack: err instanceof Error ? err.stack : undefined,
            sessionId: session.id,
          }
        );
      }
    }
  }
}
