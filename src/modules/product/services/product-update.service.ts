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
import {
  IInventoryRepositoryWrite,
  IInventoryServiceRead,
} from "@/modules/inventory/types";
import mongoose from "mongoose";
import { MongoServerError } from "mongodb";
import { withRetry } from "@/shared/utils/retry";
import { ApiError } from "@/shared/errors/api-error/ApiError";
import { ILogger } from "@/core/logger/logger.interface";
import { CreateProductType, UpdateProductRequestType } from "../schemas";
import { IProductUpdateService } from "../types/update/product-update.service.types";
import { ProductUpdateCommand } from "./commands/product-update.command";
import { IProductReadService } from "../types/read/read-product.service.types";
import { ImageVO } from "../domain/value-objects/image.value-object";
import { IInventoryServiceDelete } from "@/modules/inventory/types/delete/inventory-delete.service.types";
import { IInventoryServiceUpdate } from "@/modules/inventory/types/update/inventory-update.service.types";
import { IInventoryServiceCreate } from "@/modules/inventory/types/create/inventory-create.service.types";
import { th } from "@faker-js/faker/.";
import { CreateInventoryType } from "@/modules/inventory/schemas/create-inventory.dto";
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
    @inject(TYPES.Logger) private logger: ILogger
  ) {}
  async updateProductWithInventories(
    command: ProductUpdateCommand
  ): Promise<{ product: ProductEntity; inventories?: InventoryEntity[] }> {
    const product: ProductEntity | null =
      await this.productReadService.findProductById(command.productId);

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
            const mongoImageId = newHexStringId();
            const imageToPush: ImageVO = {
              id: mongoImageId,
              url: img.url,
              alt: img.alt,
              isPrimary: img.isPrimary,
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

    const rootInventoryRequest = command.inventory;
    //process inventory operations
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
      if (rootInventoryRequest.remove) {
        await this.inventoryDeleteUseCase.deleteInventoryPermanentById(
          rootInventoryRequest.remove,
          command.productId
        );
      }
      if (rootInventoryRequest.update) {
        const { id, stock, warehouseLocation } = rootInventoryRequest.update;
        await this.inventoryUpdateUseCase.updateInventory(id, {
          stock,
          warehouseLocation,
        });
      }
      if (rootInventoryRequest.create) {
        const { stock, warehouseLocation } = rootInventoryRequest.create;
        const inventoryCreate: CreateInventoryType = {
          stock,
          warehouseLocation,
          referenceRootId: command.productId,
        };
        await this.inventoryCreateUseCase.saveInventory(inventoryCreate);
      }
    }

    return { product };
  }
}
