import { ClientSession } from "mongoose";

export interface IInventoryServiceDelete {
  softDeleteByReference(
    referenceRootId: string,
    referenceVariantId?: string,
     options?: { session?: ClientSession }
  ): Promise<void>;
  deleteInventoryPermanentByReference(
    referenceRootId: string,
    referenceVariantId?: string,
    options?: { session?: ClientSession }
  ): Promise<void>;
  deleteInventoryPermanentById(id: string, productId: string, options?: { session: ClientSession }): Promise<void>;
  deleteManyInventoriesPermById(ids:string[],productId:string,options?:{ session:ClientSession}):Promise<void>
  deleteManyVariantInventoriesPermanent(
    referenceRootId:string,
    referenceVariantIds:string[],
    options?:{session?:ClientSession}
  ):Promise<void>
}
