import { ClientSession } from "mongoose";
import { ProductEntity } from "../../domain/product.entity";

export interface IProductReadService {
    findProductById(id:string,options?:{session:ClientSession}):Promise<ProductEntity>
    findProductsByIds(ids:string[],options?:{session:ClientSession}):Promise<ProductEntity[]>
}