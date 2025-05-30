import mongoose, {Document, Schema, Model ,Types} from "mongoose";
import { ICategoryDocument } from "../types";


  const schema = new Schema<ICategoryDocument>(
    {
      name: { type: String, required: true },
      path: { type: String, required: true, unique: true },
      image: { type: String, default: null } // Explicit null defaulAt
    },
    { timestamps: true }
  );
  
const Category: Model<ICategoryDocument> = mongoose.model<ICategoryDocument>(
  "Category",
  schema
);
export default Category;
