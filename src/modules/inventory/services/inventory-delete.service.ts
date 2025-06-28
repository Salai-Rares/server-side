import { ApiError } from "@/shared/errors/api-error/ApiError";
import { TYPES } from "@/shared/types";
import { injectable, inject } from "inversify";
import { IInventoryRepositoryWrite, IInventoryServiceRead } from "../types";
import { IInventoryRepositoryUpdate } from "../types/update/inventory-update.repository.types";
import { IInventoryRepositoryDelete } from "../types/delete/inventory-delete.repository.types";
import { IInventoryServiceDelete } from "../types/delete/inventory-delete.service.types";
import { ClientSession } from "mongoose";

@injectable()
export class InventoryDeleteUseCase implements IInventoryServiceDelete {
  constructor(
    @inject(TYPES.InventoryReadUseCase)
    private inventoryReadService: IInventoryServiceRead,
    @inject(TYPES.InventoryRepositoryUpdate)
    private inventoryUpdateRepo: IInventoryRepositoryUpdate,
    @inject(TYPES.InventoryRepositoryDelete)
    private inventoryDeleteRepo: IInventoryRepositoryDelete
  ) {}
  async deleteInventoryPermanentById(
    id: string,
    productId: string,
     options?: { session: ClientSession }
  ): Promise<void> {
    const deletedCount =
      await this.inventoryDeleteRepo.deleteInventoryPermanentById(
        id,
        productId
      );
    if (deletedCount === 0)
      throw ApiError.notFound(
        `Inventory with id: ${id}  from product id: ${productId} doesn't exist or the request was not acknowledged`
      );
  }

  async softDeleteByReference(
    referenceRootId: string,
    referenceVariantId?: string,
     options?: { session: ClientSession }
  ) {
    const inventory = await this.inventoryReadService.findInventoryByReferences(
      referenceRootId,
      referenceVariantId
    );
    if (!inventory) {
      throw ApiError.badRequest("Inventory not found for deletion.");
    }

    inventory.markAsDeleted();
    await this.inventoryUpdateRepo.updateInventory(inventory); // or update it as per your infra
  }

  async deleteInventoryPermanentByReference(
    referenceRootId: string,
    referenceVariantId?: string,
     options?: { session: ClientSession }
  ) {
    const deletedCount =
      await this.inventoryDeleteRepo.deleteInventoryPermanentByReference(
        referenceRootId,
        referenceVariantId
      );
    if (deletedCount === 0) {
      throw ApiError.notFound(
        `Inventory that references ${referenceRootId}  - ${referenceVariantId} doesn't exist or the request was not acknowledged`
      );
    }
  }
}
