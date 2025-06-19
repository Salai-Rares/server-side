import { ClientSession } from "mongoose";
import { InventoryEntity } from "../../domain/inventory.entity";

export interface IInventoryRepositoryUpdate{
    updateInventory(inventory:InventoryEntity,options?:{session:ClientSession}):Promise<InventoryEntity>
}