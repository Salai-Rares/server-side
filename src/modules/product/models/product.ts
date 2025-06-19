import mongoose, { Document, Schema, Model, Types } from "mongoose";

import { SeoMetaSchema } from "../../../shared/models";

import {
  DiscountType,
  IProduct,
  IProductDocument,
  PriceType,
  ProductImage,
  ProductVariant,
  RatingSummary,
} from "../types";
import {
  validateAttributesSize,

} from "../validators";
import {
  AllUniqueKeyAndValuesFilters,
  Filter,
} from "../types/product-query-filter.types";
import { boolean } from "zod";

const ProductImageSchema = new Schema<ProductImage>(
  {
    url: { type: String, required: true },
    alt: { type: String },
    isPrimary: { type: Boolean, default: false },
  },
);

const PriceSchema = new Schema<PriceType>(
  {
    currency: { type: String, required: true },
    amount: { type: Number, required: true },
  },
  { _id: false }
);

const DiscountSchema = new Schema<DiscountType>(
  {
    type: { type: String, enum: ["percentage", "fixed"], required: true },
    value: { type: Number, required: true },
    validUntil: { type: Date },
  },
  { _id: false }
);

const VariantSchema = new Schema<ProductVariant>({
  sku: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v: string) =>
        /^[A-ZĂÂÎȘȚ]{2,4}-[A-ZĂÂÎȘȚ0-9]{2,10}(-[A-ZĂÂÎȘȚ0-9]{2,10}){0,2}$/.test(
          v
        ),
      message: "Invalid SKU format",
    },
  },
  productOptions: { type: Map, of: String, required: true },
  price: { type: PriceSchema },

  images: { type: [ProductImageSchema] },
});

const RatingSummarySchema = new Schema<RatingSummary>(
  {
    average: { type: Number, min: 0, max: 5, default: 0 },
    count: { type: Number, min: 0, default: 0 },
  },

  { _id: false }
);

const AttributeSchema = new Schema<Filter>(
  {
    key: { type: String, required: true },
    value: { type: [String], required: true },
  },
  { _id: false }
);

//Main schema
const ProductSchema = new Schema<IProductDocument>(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    sku: {
      type: String,
      unique: true,
      required: true,
      validate: {
        validator: (v: string) =>
          /^[A-ZĂÂÎȘȚ]{2,4}-[A-ZĂÂÎȘȚ0-9]{2,10}(-[A-ZĂÂÎȘȚ0-9]{2,10}){0,2}$/.test(
            v
          ),
        message: "Invalid SKU format",
      },
    },
    description: { type: String, required: true },
    shortDescription: { type: String },

    brand: { type: Types.ObjectId, ref: "Brand" },
    categories: [{ type: Types.ObjectId, ref: "Category", required: true }],
    //used for visual
    tags: {
      type: [String],
      required: true,
      default: [],
    },

    images: { type: [ProductImageSchema]},
    price: { type: PriceSchema, required: true },
    discount: { type: DiscountSchema },
    hasVariants: { type: Boolean, default: false },
    variants: { type: [VariantSchema], required: true, default: [] },

    isFeatured: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["draft", "active", "archived", "deleted"],
      default: "draft",
      required: true,
    },

    ratings: {
      type: RatingSummarySchema,
      default: (): RatingSummary => ({
        average: 0,
        count: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      }),
    },
    reviewsCount: { type: Number },

    seo: { type: SeoMetaSchema },

    attributes: { type: [AttributeSchema], required: true, default: [] },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ProductSchema.path("attributes").validate(validateAttributesSize);




const Product: Model<IProductDocument> = mongoose.model<IProductDocument>(
  "Product",
  ProductSchema
);

export default Product;
