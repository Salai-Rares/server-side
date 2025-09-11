import { ClientSession } from "mongoose";
import { ProductEntity } from "../../domain/product.entity";

export interface IProductRepositoryUpdate {
    updateProduct(product:ProductEntity, options?:{session?:ClientSession}):Promise<ProductEntity>
}