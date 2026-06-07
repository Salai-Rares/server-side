import mongoose, { Model, Schema } from "mongoose";
import {
  DiscountConditionType,
  IDiscountDocument,
} from "../types/discount.types";

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
      enum: ["equals", "greater_than", "less_than"],
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
    enum: ["percentage", "fixed_amount", "buy_x_get_y", "free_shipping"],
    required: true,
  },
  applicationMode: {
    type: String,
    enum: ["automatic", "code_required"],
    required: true,
  },
  value: {
    type: Schema.Types.Mixed,
    required: true,
    validate: {
      validator: function (this: IDiscountDocument, v: unknown): boolean {
        if (this.type === "buy_x_get_y") {
          if (!v || typeof v !== "object" || Array.isArray(v)) return false;
          const { buyQuantity, getQuantity, getDiscount } = v as Record<string, unknown>;
          return (
            typeof buyQuantity === "number" &&
            typeof getQuantity === "number" &&
            typeof getDiscount === "number"
          );
        }
        return typeof v === "number";
      },
      message: "value shape does not match discount type",
    },
  },
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
