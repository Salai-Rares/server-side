import { toObjectId } from "@/shared/utils";
import { InventoryEntity } from "../domain/inventory.entity";
import { IInventoryDocument, IInventoryRepositoryRead } from "../types";
import Inventory from "../models/inventory.model";
import { ClientSession } from "mongoose";
import { InventoryPersistanceToEntityMapper } from "../mappers/domain/db-to-entity.mappper";
import { ApiError } from "@/shared/errors/api-error/ApiError";
import { InventoryProps } from "../domain/inventory.types";

export class InventoryRepositoryRead implements IInventoryRepositoryRead {
  async findInventoryByReferences(
    referenceRootId: string,
    referenceVariantId?: string,
    options?: { session: ClientSession }
  ): Promise<InventoryEntity | null> {
    const query: Pick<
      InventoryProps,
      "referenceRootId" | "referenceVariantId"
    > = { referenceRootId };
    if (referenceVariantId) {
      query.referenceVariantId = referenceVariantId;
    }
    const doc = await Inventory.findOne(query).session(
      options?.session ?? null
    );
    return doc
      ? InventoryPersistanceToEntityMapper.inventoryModelToEntity(doc)
      : null;
  }
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

  async findInventoriesByProductId(
    id: string,
    options?: { session: ClientSession }
  ): Promise<InventoryEntity[]> {
    const mongoId = toObjectId(id);
    const inventories = await Inventory.find(
      { referenceRootId: mongoId },
      null,
      options?.session
    )
    return inventories.map((inventory: IInventoryDocument) =>
      InventoryPersistanceToEntityMapper.inventoryModelToEntity(inventory)
    );
  }

  async findInventoriesByProductsIds(
    ids: string[],
    options?: { session: ClientSession }
  ): Promise<InventoryEntity[]> {
    if (!ids || ids.length === 0) {
      throw ApiError.badRequest(
        "Product ID list cannot be empty",
        "empty_id_list"
      );
    }
    const inventories = await Inventory.find(
      { referenceRootId: { $in: ids } },
      null,
      {
        session: options?.session,
      }
    );

    return inventories.map((inventory: IInventoryDocument) =>
      InventoryPersistanceToEntityMapper.inventoryModelToEntity(inventory)
    );
  }
}
