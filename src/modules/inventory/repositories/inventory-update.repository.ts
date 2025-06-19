import { ClientSession } from "mongoose";
import { InventoryEntity } from "../domain/inventory.entity";
import { IInventoryRepositoryUpdate } from "../types/update/inventory-update.repository.types";
import Inventory from "../models/inventory.model";
import { InventoryPersistanceToEntityMapper } from "../mappers/domain/db-to-entity.mappper";
import { ApiError } from "@/shared/errors/api-error/ApiError";

export class InventoryRepositoryUpdate implements IInventoryRepositoryUpdate {
  async updateInventory(
    inventory: InventoryEntity,
    options?: { session: ClientSession }
  ): Promise<InventoryEntity> {
    const updateData = inventory.toUpdateObject();
    const updatedDoc = await Inventory.findByIdAndUpdate(
      inventory.id,
      { $set: updateData },
      {
        new: true,
        session: options?.session,
      }
    );

    if (!updatedDoc) {
      throw  ApiError.notFound(`Inventory with ID ${inventory.id} not found.`);
    }

    return InventoryPersistanceToEntityMapper.inventoryModelToEntity(
      updatedDoc
    );
  }
}
