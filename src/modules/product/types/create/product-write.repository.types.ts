import { ClientSession, Types } from "mongoose";
import { ProductEntity } from "../../domain/product.entity";

export interface IProductRepositoryWrite {
  saveProduct(
    product: ProductEntity,
    options?: { session?: ClientSession }
  ): Promise<ProductEntity>;
}

