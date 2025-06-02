import { InventoryEntity } from "@/modules/inventory/domain/inventory.entity";
import { ProductEntity } from "../../domain/product.entity";
import { CreateProductDto } from "../../schemas";

export interface IProductCreateService{
   createProductWithInventories(
       dto: CreateProductDto
     ): Promise<{ product: ProductEntity; inventories?: InventoryEntity[] }>
}