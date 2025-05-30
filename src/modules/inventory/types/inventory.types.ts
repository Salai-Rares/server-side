import { Types, Document } from "mongoose";

export interface IInventoryBase {
  referenceId: Types.ObjectId;
  referenceType: "product" | "variant";
  stock: number;
  inStock: boolean;
  warehouseLocation?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInventory extends IInventoryBase {
  _id: Types.ObjectId;
}

export interface IInventoryDocument extends IInventoryBase, Document {
  _id: Types.ObjectId;
}
