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
      referenceId: new Types.ObjectId(entity.referenceId),
      referenceType: entity.referenceType,
      stock: entity.stock,
      inStock: entity.inStock,
      warehouseLocation: entity.warehouseLocation,
    };
  }
}
