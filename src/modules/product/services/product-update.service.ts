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
import { IInventoryRepositoryWrite } from "@/modules/inventory/types";
import mongoose from "mongoose";
import { MongoServerError } from "mongodb";
import { withRetry } from "@/shared/utils/retry";
import { ApiError } from "@/shared/errors/api-error/ApiError";
import { ILogger } from "@/core/logger/logger.interface";
import { CreateProductType, UpdateProductRequestType } from "../schemas";
import { IProductUpdateService } from "../types/update/product-update.service.types";
import { ProductUpdateCommand } from "./commands/product-update.command";
@injectable()
export class ProductUpdateUseCase implements IProductUpdateService {
  constructor(
    @inject(TYPES.ProductWriteRepository)
    private productRepository: IProductRepositoryWrite,
    @inject(TYPES.InventoryRepositoryWrite)
    private inventoryRepository: IInventoryRepositoryWrite,
    @inject(TYPES.Logger) private logger: ILogger
  ) {}
  updateProductWithInventories(product : ProductUpdateCommand) : Promise<{ product: ProductEntity; inventories?: InventoryEntity[] }>{
    
    
    throw new Error("Method not implemented.");
  }
 
    
}
