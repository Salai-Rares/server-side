import { inject, injectable } from "inversify";
import { UpdateableInventoryType } from "../schemas/inventory.dto";
import { IInventoryServiceUpdate } from "../types/update/inventory-update.service.types";
import { isValidObjectId } from "@/shared/utils";
import { ApiError } from "@/shared/errors/api-error/ApiError";
import { TYPES } from "@/shared/types";
import { IInventoryServiceRead } from "../types";
import { InventoryEntity } from "../domain/inventory.entity";
import { IInventoryRepositoryUpdate } from "../types/update/inventory-update.repository.types";
import { ClientSession } from "mongoose";
@injectable()
export class InventoryUpdateUseCase implements IInventoryServiceUpdate {
  constructor(
    @inject(TYPES.InventoryReadUseCase)
    private readService: IInventoryServiceRead,
    @inject(TYPES.InventoryRepositoryUpdate)
    private inventoryUpdateRepo: IInventoryRepositoryUpdate
  ) {}
  async updateInventory(
    inventoryId: string,
    updateData: UpdateableInventoryType,
    options?: { session: ClientSession }
  ): Promise<InventoryEntity> {
    if (!isValidObjectId(inventoryId)) {
      throw ApiError.businessRuleViolation(
        "Inventory id format is invalid",
        "id_format"
      );
    }
    const inventory: InventoryEntity = await this.readService.findInventoryById(
      inventoryId
    );
    inventory.updateInventory(updateData);
    const updatedInventory = await this.inventoryUpdateRepo.updateInventory(
      inventory,
      options
    );
    return updatedInventory;
  }
}
