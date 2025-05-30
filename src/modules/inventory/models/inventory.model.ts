import mongoose, { Document, Model, Schema, SchemaTypes, Types } from "mongoose";
import { IInventoryDocument } from "../types";


const InventorySchema = new Schema<IInventoryDocument>(
  {
    referenceType:{type:String,enum:["product","variant"],required:true},
    referenceId: { type: Schema.Types.ObjectId, required:true },
    stock: { type: Number, required: true ,min:0,default:0},
    inStock: { type: Boolean, required: true,default:false },
    warehouseLocation: { type: String },
  },
  { timestamps: true }
);
  
const Inventory: Model<IInventoryDocument> = mongoose.model<IInventoryDocument>(
  "Inventory",
  InventorySchema
);
export default Inventory;

