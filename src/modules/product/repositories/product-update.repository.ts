import { ClientSession } from "mongoose";
import { ProductEntity } from "../domain/product.entity";
import { IProductRepositoryUpdate } from "../types/update/product-update.repository.types";
import Product from "../models/product";
import { ApiError } from "@/shared/errors/api-error/ApiError";
import { ProductFromPersistanceToEntityMapper } from "../mappers/domain/db-to-entity.mapper";
import { injectable } from "inversify";
import { ProductEntityToPersistanceMapper } from "../mappers/domain/entity-to-db.mapper";
@injectable()
export class ProductRepositoryUpdate implements IProductRepositoryUpdate {
  async updateProduct(
    product: ProductEntity,
    options?: { session?: ClientSession }
  ): Promise<ProductEntity> {
    const updateData = product.toUpdateObject();
    const persistanceReadyUpdateData = ProductEntityToPersistanceMapper.mapPartialToPersistence(product,updateData)
    const updateDoc = await Product.findByIdAndUpdate(
      product.id,
      { $set: persistanceReadyUpdateData },
      { new: true, session: options?.session }
    );

    if (!updateDoc) {
      throw ApiError.notFound(`Product with ID ${product.id} not found.`);
    }
   return ProductFromPersistanceToEntityMapper.fromPersistanceToEntity(updateDoc)
  }
}
