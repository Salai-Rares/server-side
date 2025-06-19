import { InventoryEntity } from "../../domain/inventory.entity";

export interface IInventoryServiceRead{
    findInventoryById(id:string):Promise<InventoryEntity>
}