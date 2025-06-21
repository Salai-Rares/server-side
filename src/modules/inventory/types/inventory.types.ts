import { EntityStatusType } from "@/modules/shared/domain/value-objects/status.value-objects";
import { Types, Document } from "mongoose";

export interface IInventoryBase {
  referenceRootId: Types.ObjectId;
  referenceVariantId?: Types.ObjectId;
  stock: number;
  inStock: boolean;
  warehouseLocation?: string;
  status: EntityStatusType;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInventory extends IInventoryBase {
  _id: Types.ObjectId;
}

export interface IInventoryDocument extends IInventoryBase, Document {
  _id: Types.ObjectId;
}
