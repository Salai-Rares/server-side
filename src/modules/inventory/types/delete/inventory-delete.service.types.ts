import { ClientSession } from "mongoose";

export interface IInventoryServiceDelete {
  softDeleteByReference(
    referenceRootId: string,
    referenceVariantId?: string,
     options?: { session: ClientSession }
  ): Promise<void>;
  deleteInventoryPermanentByReference(
    referenceRootId: string,
    referenceVariantId?: string,
    options?: { session: ClientSession }
  ): Promise<void>;
  deleteInventoryPermanentById(id: string, productId: string, options?: { session: ClientSession }): Promise<void>;
}
