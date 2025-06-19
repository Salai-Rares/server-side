import { InventoryEntity } from "../../domain/inventory.entity";
import { IInventoryDocument } from "../../types";

export class InventoryPersistanceToEntityMapper{
    static inventoryModelToEntity(model: IInventoryDocument): InventoryEntity {
    return new InventoryEntity({
        id: model._id.toString(),
        referenceRootId: model.referenceRootId.toHexString(),
        referenceVariantId: model.referenceVariantId ? model.referenceVariantId.toHexString() : undefined,
        stock: model.stock,
        warehouseLocation: model.warehouseLocation,
        createdAt: model.createdAt,
        updatedAt: model.updatedAt
    });
}
}