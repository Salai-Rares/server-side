import { InventoryEntity } from "@/modules/inventory/domain/inventory.entity";
import { ProductEntity } from "../../domain/product.entity";
import { CreateProductType, UpdateProductRequestType } from "../../schemas";
import { ProductUpdateCommand } from "../../services/commands/product-update.command";

export interface IProductUpdateService {
  updateProductWithInventories(
    product: ProductUpdateCommand
  ): Promise<{ product: ProductEntity; inventories?: InventoryEntity[] }>;
}
