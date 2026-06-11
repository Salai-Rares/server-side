import { InventoryEntity } from "@/modules/inventory/domain/inventory.entity";
import { ProductEntity } from "../../domain/product.entity";
import { ProductUpdateCommand } from "../../services/commands/product-update.command";
import { CallerContext } from "@/shared/types";

export interface IProductUpdateService {
  updateProductWithInventories(
    command: ProductUpdateCommand,
    caller: CallerContext
  ): Promise<{ product: ProductEntity; inventories: InventoryEntity[] }>;
}
