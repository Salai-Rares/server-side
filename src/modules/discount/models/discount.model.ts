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
        "subtotal",
        "quantity",
        "user_segment",
      ],
      required: true,
    },
    value: { type: Schema.Types.Mixed, required: true },
    operator: {
      type: String,
      enum: ["equals", "at_least", "at_most", "greater_than", "less_than"],
      required: true,
    },
    // Only aggregate conditions (subtotal, quantity) carry a scope; absent
    // means "cart", which the VO applies as its default.
    scope: {
      type: String,
      enum: ["cart", "matched_items"],
      required: false,
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
  stackable: { type: Boolean, default: false },
  excludeOnSale: { type: Boolean, default: false },
  priority: { type: Number, required: true, min: 0, max: 3 },
  conditions: { type: [ConditionSchema], min: 1, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

const DiscountModel: Model<IDiscountDocument> =
  mongoose.model<IDiscountDocument>("Discount", DiscountSchema);

export default DiscountModel;
