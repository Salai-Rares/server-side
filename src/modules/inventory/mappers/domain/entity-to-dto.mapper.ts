import { InventoryEntity } from "../../domain/inventory.entity";
interface InventoryResponseDto {
  id: string;
  stock: number;
  inStock: boolean;
  warehouseLocation: string | null;
  referenceRootId: string;
  referenceVariantId: string | null;
  status: string; // <- would be caught if missing
  createdAt: string | null;
  updatedAt: string | null;
}


export class InventoryEntityToResponseDtoMapper {
  static toDto(entity: InventoryEntity): InventoryResponseDto {
    return {
      id: entity.id,
      stock: entity.stock,
      inStock: entity.inStock,
      warehouseLocation: entity.warehouseLocation ?? null,
      referenceRootId: entity.referenceRootId,
      referenceVariantId: entity.referenceVariantId ?? null,
      status : entity.status.value,
      createdAt: entity.createdAt?.toISOString() ?? null,
      updatedAt: entity.updatedAt?.toISOString() ?? null,
    };
  }
}
