import { InventoryEntity } from "@/modules/inventory/domain/inventory.entity";
import { ProductEntity } from "../../domain/product.entity";
import { CreateProductType } from "../../schemas";
import { CallerContext } from "@/shared/types";

export interface IProductCreateService{
   createProductWithInventories(
       dto: CreateProductType,
       caller: CallerContext
     ): Promise<{ product: ProductEntity; inventories?: InventoryEntity[] }>
}