import {
  ArchivedMetadataType,
  DeletedMetadataType,
  ProductImage,
  PublishedMetadataType,
  RatingSummary,
  VatRateType,
} from "../types";
import { AllUniqueKeyAndValuesFilters } from "../types/product-query-filter.types";
import { ProductDescriptionVO } from "./value-objects/description/description.value-object";
import { ShortProductDescriptionVO } from "./value-objects/description/short-description.value-object";
import { ImageVO } from "./value-objects/image.value-object";
import { PriceVO } from "./value-objects/price.value-object";
import { SeoMetaVO } from "./value-objects/seo-meta.value-object";
import { ProductSkuVO } from "./value-objects/sku.value-object";
import { SlugVO } from "./value-objects/slug.value-object";
import { EntityStatusVO } from "@/core/domain/value-objects/status.value-objects";
import { ProductVariantEntity } from "./variant-product.entity";
import { Types } from "mongoose";

export interface ProductProps {
  id: string;
  sku: ProductSkuVO;
  slug: SlugVO;
  name: string;
  description?: ProductDescriptionVO;
  shortDescription?: ShortProductDescriptionVO;
  brand?: string;
  categories?: string[];
  tags?: string[];
  images?: ImageVO[];
  price?: PriceVO;
  costPrice?: PriceVO;
  vatRate?: VatRateType;
  productOptions?: ReadonlyMap<string, string>;
  variants?: ProductVariantEntity[];
  isFeatured?: boolean;
  status: EntityStatusVO;
  ratings: RatingSummary;
  reviewsCount: number;
  seo?: SeoMetaVO;
  attributes?: AllUniqueKeyAndValuesFilters;
  //this should be enforced once we have user functionality because all products are published by a user so remove the optional '?'
  publishedMetaData?: PublishedMetadataVO;
  //this should be enforced once we have user functionality because all products are archived by a user so remove the optional '?'
  archivedMetaData?: ArchivedMetadataVO;
  //this should be enforced once we have user functionality because all products are deleted by a user so remove the optional '?'
  deletedMetaData?: DeletedMetadataVO;
  //this should be enforced once we have user functionality because all products are created by a user so remove the optional '?'
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PublishedMetadataVO {
  publishedAt: Date;
  publishedBy: string;
}

export interface ArchivedMetadataVO {
  archivedAt: Date;
  archivedBy: string;
}

export interface DeletedMetadataVO {
  deletedAt: Date;
  deletedBy: string;
}
