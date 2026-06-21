import { Types } from "mongoose";

export interface ICouponBase {
  code: string;
  discountId: Types.ObjectId;
  createdBy: Types.ObjectId;
  usageLimit?: number;
  usageCount: number;
  active: boolean;
  expiresAt?: Date;
}

export interface ICoupon extends ICouponBase {
  _id: Types.ObjectId;
}

export interface ICouponDocument extends Document, ICouponBase {
  _id: Types.ObjectId;
}
