import mongoose, { Model, Schema } from "mongoose";
import { SESSION_TTL_MS } from "@/constants";
import { ICartDocument } from "../types/cart.types";

/**
 * A guest cart is reachable only while its session still exists, because the
 * guestId lives nowhere else. So this is derived from the session lifetime
 * rather than restated:
 *
 *  - shorter than the session would delete carts shoppers can still see;
 *  - longer than the session only retains rows nobody can reach again.
 *
 * Doubling leaves room for a session whose expiry gets pushed out by a late
 * write, without hoarding indefinitely.
 */
const GUEST_CART_TTL_SECONDS = (SESSION_TTL_MS * 2) / 1000;

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
    // Optimistic concurrency token. Every save filters on the value it read and
    // increments it, so a write built from stale items cannot land.
    version: { type: Number, default: 0, required: true },
  },
  { timestamps: true }
);

// Expires abandoned guest carts only; user carts are never swept.
// $type: "string" rather than $exists, because $exists also matches a document
// carrying an explicit guestId: null, which would put user carts in scope.
CartSchema.index(
  { updatedAt: 1 },
  {
    name: "guest_cart_ttl",
    expireAfterSeconds: GUEST_CART_TTL_SECONDS,
    partialFilterExpression: { guestId: { $type: "string" } },
  }
);

const CartModel: Model<ICartDocument> =
  mongoose.model<ICartDocument>("Cart", CartSchema);

export default CartModel;
