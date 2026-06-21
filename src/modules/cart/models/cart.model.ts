import mongoose, { Model, Schema } from "mongoose";
import { ICartDocument } from "../types/cart.types";

const CartItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variantId: { type: Schema.Types.ObjectId },
    quantity: { type: Number, required: true, min: 1 },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const CartSchema = new Schema<ICartDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", sparse: true, unique: true },
    guestId: { type: String, sparse: true, unique: true },
    items: { type: [CartItemSchema], default: [] },
  },
  { timestamps: true }
);

const CartModel: Model<ICartDocument> =
  mongoose.model<ICartDocument>("Cart", CartSchema);

export default CartModel;
