import { EntityStatusVO } from "@/core/domain/value-objects/status.value-objects";
import { InventoryProps } from "../../domain/inventory.types";
import { CreateInventoryType } from "../../schemas/create-inventory.dto";

export class InventoryDtoToEntityMapper {
  static mapToEntity(
    inventory: CreateInventoryType
  ): Omit<InventoryProps, "id"> {
    return {
      referenceRootId: inventory.referenceRootId,
      referenceVariantId: inventory.referenceVariantId,
      stock: inventory.stock,
      status: EntityStatusVO.draft(),
      warehouseLocation: inventory.warehouseLocation,
    };
  }
}
