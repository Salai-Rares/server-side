import { InventoryEntity } from "@/modules/inventory/domain/inventory.entity";
import { ProductEntity } from "../../domain/product.entity";
import { CreateProductType, UpdateProductRequestType } from "../../schemas";

export interface IProductUpdateService {
  updateProductWithInventories(
    productId: string,
    updates: { dto: UpdateProductRequestType, files?:Express.Multer.File[]}
   
  ): Promise<{ product: ProductEntity; inventories?: InventoryEntity[] }>;
}
