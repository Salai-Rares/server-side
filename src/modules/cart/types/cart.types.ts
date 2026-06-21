import { Types } from "mongoose";

export interface ICartItemBase {
  productId: Types.ObjectId;
  variantId?: Types.ObjectId;
  quantity: number;
  addedAt: Date;
}

export interface ICartBase {
  userId?: Types.ObjectId;
  guestId?: string;
  items: ICartItemBase[];
}

export interface ICart extends ICartBase {
  _id: Types.ObjectId;
}

export interface ICartDocument extends Document, ICartBase {
  _id: Types.ObjectId;
}
