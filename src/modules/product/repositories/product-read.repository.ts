import { toObjectId } from "@/shared/utils";
import { ProductEntity } from "../domain/product.entity";
import Product from "../models/product";
import { IProductRepositoryRead } from "../types/read/product-read.repository.types";
import { ProductFromPersistanceToEntityMapper } from "../mappers/domain/db-to-entity.mapper";
import { ClientSession } from "mongoose";
import { ApiError } from "@/shared/errors/api-error/ApiError";
import { IProductDocument } from "../types";

export class ProductReadRepository implements IProductRepositoryRead {
  async findProductsByIds(
    ids: string[],
    options?: { session: ClientSession }
  ): Promise<ProductEntity[]> {
    if (!ids || ids.length === 0) {
      throw ApiError.badRequest(
        "Product ID list cannot be empty",
        "empty_id_list"
      );
    }
    const products = await Product.find({ _id: { $in: ids } }, null, {
      session: options?.session,
    });

    return products.map((product: IProductDocument) =>
      ProductFromPersistanceToEntityMapper.fromPersistanceToEntity(product)
    );
  }
  async findProductById(
    id: string,
    options?: { session: ClientSession }
  ): Promise<ProductEntity | null> {
    const product = await Product.findById(toObjectId(id), null, {
      session: options?.session,
    });

    return product
      ? ProductFromPersistanceToEntityMapper.fromPersistanceToEntity(product)
      : null;
  }
}
