import { ClientSession } from "mongoose";
import { InventoryEntity } from "../domain/inventory.entity";

export interface IInventoryRepository{
    saveInventory(inventory:InventoryEntity,options?: { session?: ClientSession }):Promise<InventoryEntity>;
    saveBulkInventories(inventories : InventoryEntity[],options?: { session?: ClientSession }):Promise<InventoryEntity[]>;
    
}