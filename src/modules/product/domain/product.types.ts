import { RatingSummary, VatRateType } from "../types";
import { AllUniqueKeyAndValuesFilters } from "../types/product-query-filter.types";
import { EntityStatusType, EntityStatusVO } from "@/core/domain/value-objects/status.value-objects";
import { ProductDescriptionVO } from "./value-objects/description/description.value-object";
import { ShortProductDescriptionVO } from "./value-objects/description/short-description.value-object";
import { ImageVO } from "./value-objects/image.value-object";
import { PriceVO } from "./value-objects/price.value-object";
import { SeoMetaVO } from "./value-objects/seo-meta.value-object";
import { ProductSkuVO } from "./value-objects/sku.value-object";
import { SlugVO } from "./value-objects/slug.value-object";
import { ProductVariantEntity } from "./variant-product.entity";

export interface StatusHistoryEntryVO {
  status: EntityStatusType;
  changedAt: Date;
  changedBy: string;
  reason?: string;
}

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
  compareAtPrice?: { original: PriceVO; expiresAt?: Date };
  priceHistory?: { price: PriceVO; changedAt: Date; changedBy: string }[];
  vatRate?: VatRateType;
  productOptions?: ReadonlyMap<string, string>;
  variants?: ProductVariantEntity[];
  isFeatured?: boolean;
  status: EntityStatusVO;
  ratings: RatingSummary;
  reviewsCount: number;
  seo?: SeoMetaVO;
  attributes?: AllUniqueKeyAndValuesFilters;
  statusHistory?: StatusHistoryEntryVO[];
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}
