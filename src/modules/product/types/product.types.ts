import { SeoMeta, ImageMeta } from "@/shared/types";
import mongoose, { Types, Document, LeanDocument } from "mongoose";
import { AllUniqueKeyAndValuesFilters } from "./product-query-filter.types";
import { EntityStatusType } from "@/core/domain/value-objects/status.value-objects";

// Define an interface that describes the shape of a Product document
export interface IProductBase {
  slug: string;
  sku: string;

  name: string;
  description?: string;
  shortDescription?: string;

  //will be added to the list of attributes
  brand?: Types.ObjectId;
  categories?: mongoose.Types.ObjectId[]; // Array of ObjectIds referencing the Category model
  //will be added to the list of attributes
  tags?: string[]; //e.g. ["eco-friendly","bestseller"]

  images?: ProductImage[];
  price?: PriceType;
  costPrice?: PriceType;
  vatRate?: 5 | 9 | 21;
  discount?: Types.ObjectId;
  productOptions?: ReadonlyMap<string, string>;
  hasVariants: boolean;
  variants?: ProductVariant[]; // color/size options

  isFeatured?: boolean;
  status: EntityStatusType;

  ratings: RatingSummary;
  reviewsCount: number;

  seo?: SeoMeta;

  attributes?: AllUniqueKeyAndValuesFilters;
  publishedMetaData?: PublishedMetadataType;
  archivedMetaData?: ArchivedMetadataType;
  deletedMetaData?: DeletedMetadataType;
  //this should be enforced once we have user functionality because all products are created by a user so remove the optional '?'
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProduct extends IProductBase {
  _id: Types.ObjectId;
}
export interface IProductDocument extends Document, IProductBase {}
export type IProductLean = LeanDocument<IProduct>;
export interface ProductImage extends ImageMeta {
  _id: Types.ObjectId;
}
export interface PublishedMetadataType {
  publishedAt: Date;
  publishedBy: Types.ObjectId;
}

export interface ArchivedMetadataType {
  archivedAt: Date;
  archivedBy: Types.ObjectId;
}

export interface DeletedMetadataType {
  deletedAt: Date;
  deletedBy: Types.ObjectId;
}

export interface PriceType {
  currency: string; // e.g., 'USD', 'LEU'
  amount: number; // base price
}

// export interface DiscountType {
//   type: "percentage" | "fixed";
//   value: number;
//   validUntil?: Date;
// }

export interface ProductVariant {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  sku: string;
  productOptions?: ReadonlyMap<string, string>; // e.g., { color: 'red', size: 'M' }
  price?: PriceType; // optional override
  costPrice?: PriceType;
  vatRate?: 5 | 9 | 21;
  images?: ProductImage[];
  discount?: Types.ObjectId;
}

export interface RatingSummary {
  average: number; // e.g., 4.6
  count: number; // number of total ratings
  distribution: {
    // Counts for each star rating
    1: number; // 1-star reviews
    2: number; // 2-star reviews
    3: number; // 3-star reviews
    4: number; // 4-star reviews
    5: number; // 5-star reviews
  };
  // Optional: Computed percentages (can be added dynamically)
  percentageDistribution?: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export type VatRateType = 5 | 9 | 21;
