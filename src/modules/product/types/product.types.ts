import { SeoMeta, ImageMeta } from "@/shared/types";
import mongoose, { Types, Document, LeanDocument } from "mongoose";
import { AllUniqueKeyAndValuesFilters } from "./product-query-filter.types";
import { EntityStatusType } from "@/core/domain/value-objects/status.value-objects";

export interface StatusHistoryEntry {
  status: EntityStatusType;
  changedAt: Date;
  changedBy: string;
  reason?: string;
}

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
  compareAtPrice?: CompareAtPriceType;
  priceHistory?: PriceHistoryEntry[];
  vatRate?: 5 | 9 | 21;
  productOptions?: ReadonlyMap<string, string>;
  hasVariants: boolean;
  variants?: ProductVariant[]; // color/size options

  isFeatured?: boolean;
  status: EntityStatusType;

  ratings: RatingSummary;
  reviewsCount: number;

  seo?: SeoMeta;

  attributes?: AllUniqueKeyAndValuesFilters;
  statusHistory: StatusHistoryEntry[];
  createdBy: Types.ObjectId;
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
export interface PriceType {
  currency: string;
  amount: number;
}

export interface CompareAtPriceType {
  original: PriceType;
  expiresAt?: Date;
}

export interface PriceHistoryEntry {
  price: PriceType;
  changedAt: Date;
  changedBy: string;
}

export interface ProductVariant {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  sku: string;
  productOptions?: ReadonlyMap<string, string>;
  price?: PriceType;
  costPrice?: PriceType;
  compareAtPrice?: CompareAtPriceType;
  priceHistory?: PriceHistoryEntry[];
  vatRate?: 5 | 9 | 21;
  images?: ProductImage[];
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
