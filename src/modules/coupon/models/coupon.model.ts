import mongoose, { Model, Schema } from "mongoose";
import { ICouponDocument } from "../types/coupon.types";

const CouponSchema = new Schema<ICouponDocument>({
  code: { type: String, required: true, unique: true, uppercase: true },
  discountId: { type: Schema.Types.ObjectId, ref: "Discount", required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  usageLimit: { type: Number },
  usageCount: { type: Number, required: true, default: 0 },
  active: { type: Boolean, required: true, default: true },
  expiresAt: { type: Date },
}, { timestamps: true });

const CouponModel: Model<ICouponDocument> =
  mongoose.model<ICouponDocument>("Coupon", CouponSchema);

export default CouponModel;
