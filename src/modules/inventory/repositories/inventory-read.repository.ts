import { toObjectId } from "@/shared/utils";
import { InventoryEntity } from "../domain/inventory.entity";
import { IInventoryRepositoryRead } from "../types";
import Inventory from "../models/inventory.model";
import { ClientSession } from "mongoose";
import { InventoryPersistanceToEntityMapper } from "../mappers/domain/db-to-entity.mappper";

export class InventoryRepositoryRead implements IInventoryRepositoryRead {
  async findInventoryById(
    id: string,
    options?: { session: ClientSession }
  ): Promise<InventoryEntity | null> {
    const mongoId = toObjectId(id);
    const inventory = await Inventory.findById(mongoId, null, options?.session);
    return inventory
      ? InventoryPersistanceToEntityMapper.inventoryModelToEntity(inventory)
      : null;
  }
}
