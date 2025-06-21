import { Types } from "mongoose";
import { InventoryEntity } from "../../domain/inventory.entity";
import { IInventory, IInventoryBase } from "../../types";
import { toObjectId } from "@/shared/utils";

export class InventoryEntityToPersistanceMapper {
  public static toPersistance(
    entity: InventoryEntity
  ): Omit<IInventory, "createdAt" | "updatedAt"> {
    return {
      _id: toObjectId(entity.id), // convert string ID to ObjectId
      referenceRootId: toObjectId(entity.referenceRootId),
      referenceVariantId: entity.referenceVariantId
        ? toObjectId(entity.referenceVariantId)
        : undefined,
      status: entity.status.value,
      stock: entity.stock,
      inStock: entity.inStock,
      warehouseLocation: entity.warehouseLocation,
    };
  }
}
