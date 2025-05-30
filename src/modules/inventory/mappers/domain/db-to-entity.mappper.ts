import { InventoryEntity } from "../../domain/inventory.entity";
import { IInventoryDocument } from "../../types";

export class InventoryPersistanceToEntityMapper{
    static inventoryModelToEntity(model: IInventoryDocument): InventoryEntity {
    return new InventoryEntity({
        id: model._id.toString(),
        referenceType: model.referenceType,
        referenceId: model.referenceId.toString(),
        stock: model.stock,
        inStock: model.inStock,
        warehouseLocation: model.warehouseLocation,
        createdAt: model.createdAt,
        updatedAt: model.updatedAt
    });
}
}