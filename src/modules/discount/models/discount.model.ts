import mongoose, { Model, Schema } from "mongoose";
import {
  DiscountConditionType,
  IDiscountDocument,
} from "../types/discount.types";
import { any } from "zod";
// import { DiscountType } from "@/modules/product/schemas";

const ConditionSchema = new Schema<DiscountConditionType>(
  {
    type: {
      type: String,
      enum: [
        "product",
        "variant",
        "category",
        "tag",
        "cart_total",
        "quantity",
        "user_segment",
      ],
      required: true,
    },
    value: { type: Schema.Types.Mixed, required: true },
    operator: {
      type: String,
      enum: ["equals", "in", "greater_than", "less_than"],
      required: true,
    },
  },
  { _id: false }
);

const DiscountSchema = new Schema<IDiscountDocument>({
  name: { type: String, required: true },
  description: { type: String },
  type: {
    type: String,
    enum: ["percentage", "fixed_amount", "buy_x_get_y"],
    required: true,
  },
  value: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  usageLimit: { type: Number },
  usageCount: { type: Number, required: true, default: 0 },
  active: { type: Boolean, default: false },
  conditions: { type: [ConditionSchema], min: 1,required:true },
});

const DiscountModel: Model<IDiscountDocument> =
  mongoose.model<IDiscountDocument>("Discount", DiscountSchema);

export default DiscountModel;
