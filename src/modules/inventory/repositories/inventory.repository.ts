import { ClientSession, Error } from "mongoose";
import { InventoryEntity } from "../domain/inventory.entity";
import { InventoryPersistanceToEntityMapper } from "../mappers/domain/db-to-entity.mappper";
import { InventoryEntityToPersistanceMapper } from "../mappers/domain/entity-to-db.mapper";
import Inventory from "../models/inventory.model";
import { IInventoryRepository } from "../types";

export class InventoryRepository implements IInventoryRepository {
  async saveInventory(inventory: InventoryEntity,options?: { session?: ClientSession }): Promise<InventoryEntity> {
    console.log('helpp pp!@#SFAA')
    const inventoryData =
      InventoryEntityToPersistanceMapper.toPersistance(inventory);
    const [savedInventory] = await Inventory.create([inventoryData],{session:options?.session});
    console.log('inventory repo', savedInventory)
    return InventoryPersistanceToEntityMapper.inventoryModelToEntity(
      savedInventory
    );
  }

  async saveBulkInventories(
    inventories: InventoryEntity[],options?: { session?: ClientSession }
  ): Promise<InventoryEntity[]> {
    const inventoryData = inventories.map(
      InventoryEntityToPersistanceMapper.toPersistance
    );
    
    // Will fail completely if any document fails
    const savedInventories = await Inventory.insertMany(inventoryData, {
      ordered: true,
       // Stop on first error (default behavior)
       session:options?.session
    });

    return savedInventories.map(
      InventoryPersistanceToEntityMapper.inventoryModelToEntity
    );
  }
}
