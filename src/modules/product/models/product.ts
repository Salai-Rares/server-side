import mongoose, { Document, Schema, Model, Types } from "mongoose";

import { SeoMetaSchema } from "../../../shared/models";

import {
  ArchivedMetadataType,
  DeletedMetadataType,
  // DiscountType,
  IProduct,
  IProductDocument,
  PriceType,
  ProductImage,
  ProductVariant,
  PublishedMetadataType,
  RatingSummary,
} from "../types";
import { validateAttributesSize } from "../validators";
import {
  AllUniqueKeyAndValuesFilters,
  Filter,
} from "../types/product-query-filter.types";
import { boolean } from "zod";
import { PRODUCT_LIMITS } from "../constants/product-validation.constants";

const ProductImageSchema = new Schema<ProductImage>({
  url: { type: String, required: true },
  alt: { type: String, required: true },
});

const PriceSchema = new Schema<PriceType>(
  {
    currency: { type: String, required: true },
    amount: { type: Number, required: true },
  },
  { _id: false }
);

const VariantSchema = new Schema<ProductVariant>({
  name: {
    type: String,
    required: true,
    minlength: PRODUCT_LIMITS.NAME.MIN_LENGTH,
    maxlength: PRODUCT_LIMITS.NAME.MAX_LENGTH,
  },
  slug: { type: String, required: true },
  sku: {
    type: String,
    required: true,
    validate: {
      validator: (v: string) =>
        /^[A-ZĂÂÎȘȚ]{2,4}-[A-ZĂÂÎȘȚ0-9]{2,10}(-[A-ZĂÂÎȘȚ0-9]{2,10}){0,2}$/.test(
          v
        ),
      message: "Invalid SKU format",
    },
  },
  productOptions: { type: Map, of: String },
  price: { type: PriceSchema },
  costPrice: { type: PriceSchema },
  vatRate: {
    type: Number,
    enum: [5, 9, 21],
  },
  discount: { type: Types.ObjectId, ref: "Discount" },
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
const PublishedMetadataSchema = new Schema<PublishedMetadataType>(
  {
    publishedAt: { type: Date, required: true },
    //here change on required : true when user functionality is added
    publishedBy: { type: Schema.Types.ObjectId, required: false },
  },
  { _id: false }
);
const ArchivedMetadataSchema = new Schema<ArchivedMetadataType>(
  {
    archivedAt: { type: Date, required: true },
    //here change on required : true when user functionality is added
    archivedBy: { type: Schema.Types.ObjectId, required: false },
  },
  { _id: false }
);

const DeletedMetadataSchema = new Schema<DeletedMetadataType>(
  {
    deletedAt: { type: Date, required: true },
    //here change on required : true when user functionality is added
    deletedBy: { type: Schema.Types.ObjectId, required: false },
  },
  {
    _id: false,
  }
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
    description: { type: String },
    shortDescription: { type: String },

    brand: { type: Types.ObjectId, ref: "Brand" },
    categories: [{ type: Types.ObjectId, ref: "Category" }],
    //used for visual
    tags: {
      type: [String],
    },

    images: { type: [ProductImageSchema] },
    price: { type: PriceSchema },
    costPrice: { type: PriceSchema },
    vatRate: {
      type: Number,
      enum: [5, 9, 21],
    },
    discount: { type: Types.ObjectId, ref: "Discount" },
    hasVariants: { type: Boolean, default: false },
    variants: { type: [VariantSchema], default: [] },

    isFeatured: { type: Boolean, default: false },
    status: {
      type: String,
      enum: PRODUCT_LIMITS.STATUS.POSSIBLE_VALUES,
      default: PRODUCT_LIMITS.STATUS.DEFAULT_VALUE,
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

    attributes: { type: [AttributeSchema], default: [] },
    productOptions: { type: Map, of: String },
    publishedMetaData: { type: PublishedMetadataSchema },
    archivedMetaData: { type: ArchivedMetadataSchema },
    deletedMetaData: { type: DeletedMetadataSchema },
    createdBy : {type : Schema.Types.ObjectId}
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
