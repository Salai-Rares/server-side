import { Schema } from "mongoose";
import { ISeoMeta } from "./types";

 export const SeoMetaSchema = new Schema<ISeoMeta>({
    title: { type: String },
    description: { type: String },
    keywords: { type: [String] },
    cannonicalUrl: { type: String }
  }, { _id: false });