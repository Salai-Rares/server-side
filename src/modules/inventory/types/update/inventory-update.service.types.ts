import { ClientSession } from "mongoose";
import { UpdateableInventoryType, UpdateInventoryType } from "../../schemas/inventory.dto";

export interface IInventoryServiceUpdate{
    updateInventory(inventoryId:string,updateData:UpdateableInventoryType,options?:{session:ClientSession}):void
}