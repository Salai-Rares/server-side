import mongoose, {
  Document,
  Model,
  Schema,
  SchemaTypes,
  Types,
} from "mongoose";
import { IInventoryDocument } from "../types";
import { PRODUCT_LIMITS } from "@/modules/product/constants/product-validation.constants";

const InventorySchema = new Schema<IInventoryDocument>(
  {
    referenceRootId: { type: Schema.Types.ObjectId, required: true },
    referenceVariantId: { type: Schema.Types.ObjectId, required: false },
    stock: { type: Number, required: true, min: 0, default: 0 },
    status: {
      type: String,
      enum: PRODUCT_LIMITS.STATUS.POSSIBLE_VALUES,
      default: PRODUCT_LIMITS.STATUS.DEFAULT_VALUE,
      required: true,
    },
    inStock: { type: Boolean, required: true, default: false },
    warehouseLocation: { type: String },
  },
  { timestamps: true }
);

InventorySchema.index(
  { referenceRootId: 1, referenceVariantId: 1 },
  { unique: true, sparse: true }
);

const Inventory: Model<IInventoryDocument> = mongoose.model<IInventoryDocument>(
  "Inventory",
  InventorySchema
);
export default Inventory;
