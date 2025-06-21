import { ClientSession } from "mongoose";
import { InventoryEntity } from "../../domain/inventory.entity";

export interface IInventoryServiceRead {
  findInventoryById(
    id: string,
    options?: { session: ClientSession }
  ): Promise<InventoryEntity>;
  findInventoriesByProductId(
    id: string,
    options?: { session: ClientSession }
  ): Promise<InventoryEntity[]>;
  findInventoriesByProductsIds(ids:string[],
    options?: { session: ClientSession }):Promise<InventoryEntity[]>
}
