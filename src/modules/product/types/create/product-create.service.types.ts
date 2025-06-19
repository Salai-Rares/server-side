import { InventoryEntity } from "@/modules/inventory/domain/inventory.entity";
import { ProductEntity } from "../../domain/product.entity";
import { CreateProductType } from "../../schemas";

export interface IProductCreateService{
   createProductWithInventories(
       dto: CreateProductType
     ): Promise<{ product: ProductEntity; inventories?: InventoryEntity[] }>
}