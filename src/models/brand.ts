import mongoose, { Types, Document, Schema, Model } from "mongoose";
import {  SeoMetaSchema } from "@/shared/models";
import {SeoMeta} from "@/shared/types"
export interface IBrand {
  _id: Types.ObjectId;
  name: string;
  slug:string;
  description?:string;
  image:string;
  seo?:SeoMeta
}

export type IBrandDocument = Document<unknown, {}, IBrand> &
  Omit<IBrand, "_id">;

export const BrandSchema = new Schema<IBrand>({
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description:{type:String},
    seo: { type: SeoMetaSchema }

})

const Brand: Model<IBrandDocument> = mongoose.model<IBrandDocument>(
  "Brand",
  BrandSchema
);
export default Brand;
