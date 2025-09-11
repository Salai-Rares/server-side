import { ClientSession } from "mongoose";
import { InventoryEntity } from "../../domain/inventory.entity";
import { CreateInventoryType } from "../../schemas/create-inventory.dto";
import { InventoryCreateType } from "../../schemas/inventory.dto";
import { ProductEntity } from "@/modules/product/domain/product.entity";

export interface IInventoryServiceCreate {
  saveInventory(
    inventory: CreateInventoryType,
    options?: { session: ClientSession }
  ): Promise<InventoryEntity>;
  saveBulkInventories(
    inventory: CreateInventoryType[],
    options?: { session: ClientSession }
  ): Promise<InventoryEntity[]>;
  saveInventoryForKnownProduct(
    product: ProductEntity,
    inventory: CreateInventoryType,
    options?: { session?: ClientSession }
  ): Promise<InventoryEntity>
}
