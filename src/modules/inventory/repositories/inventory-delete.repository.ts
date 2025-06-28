import { injectable } from "inversify";
import { IInventoryRepositoryDelete } from "../types/delete/inventory-delete.repository.types";
import Inventory from "../models/inventory.model";
import { InventoryProps } from "../domain/inventory.types";
import { DeleteResult } from "mongodb";
import { toObjectId } from "@/shared/utils";
import { IInventoryBase } from "../types";
import { ClientSession, Types } from "mongoose";
@injectable()
export class InventoryRepositoryDelete implements IInventoryRepositoryDelete {
  async deleteInventoryPermanentById(
    id: string,
    productId: string,
    options?: { session: ClientSession }
  ): Promise<number> {
    const mongoId = toObjectId(id);
    const deleteQuery: {
      _id: Types.ObjectId;
      referenceRootId?: Types.ObjectId;
    } = { _id: mongoId };
    const productMongoId = toObjectId(productId);
    deleteQuery.referenceRootId = productMongoId;

    const result: DeleteResult = await Inventory.deleteOne(deleteQuery,{session:options?.session});
    return result.deletedCount ?? 0;
  }
  async deleteInventoryPermanentByReference(
    referenceRootId: string,
    referenceVariantId?: string,
    options?: { session: ClientSession }
  ): Promise<number> {
    const mongoRefRootId = toObjectId(referenceRootId);
    const deleteQuery: Pick<
      IInventoryBase,
      "referenceRootId" | "referenceVariantId"
    > = { referenceRootId: mongoRefRootId };
    if (referenceVariantId) {
      const mongoRefVarId = toObjectId(referenceVariantId);
      deleteQuery["referenceVariantId"] = mongoRefVarId;
    }
    const result: DeleteResult = await Inventory.deleteOne(deleteQuery,{session:options?.session});
    return result.deletedCount ?? 0;
  }
}
