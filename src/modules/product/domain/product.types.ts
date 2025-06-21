import { ProductImage, RatingSummary } from "../types";
import { AllUniqueKeyAndValuesFilters } from "../types/product-query-filter.types";
import { ProductDescriptionVO } from "./value-objects/description/description.value-object";
import { ShortProductDescriptionVO } from "./value-objects/description/short-description.value-object";
import { DiscountVO } from "./value-objects/discount.value-object";
import { ImageVO } from "./value-objects/image.value-object";
import { PriceVO } from "./value-objects/price.value-object";
import { SeoMetaVO } from "./value-objects/seo-meta.value-object";
import { ProductSkuVO } from "./value-objects/sku.value-object";
import { SlugVO } from "./value-objects/slug.value-object";
import { EntityStatusVO } from "@/modules/shared/domain/value-objects/status.value-objects";
import { ProductVariantEntity } from "./variant-product.entity";

export interface ProductProps{
    id:string,
    sku:ProductSkuVO,
    slug:SlugVO,
    name:string,
    description:ProductDescriptionVO,
    shortDescription?:ShortProductDescriptionVO,
    brand?:string,
    categories:string[],
    tags?:string[],
    images?:ImageVO[],
    price:PriceVO,
    discount?:DiscountVO,
    variants?:ProductVariantEntity[],
    isFeatured?:boolean,
    status:EntityStatusVO,
    ratings:RatingSummary,
    reviewsCount:number,
    seo?:SeoMetaVO,
    attributes?:AllUniqueKeyAndValuesFilters,
    createdAt?:Date,
    updatedAt?:Date
}