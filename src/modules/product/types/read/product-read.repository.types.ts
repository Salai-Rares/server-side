import { ClientSession } from "mongoose";
import { ProductEntity } from "../../domain/product.entity";


export interface IProductRepositoryRead {
  findProductById(id: string, options?: { session: ClientSession; }): Promise<ProductEntity | null>;
  findProductsByIds(ids: string[], options?: { session: ClientSession; }): Promise<ProductEntity[]>;
}
