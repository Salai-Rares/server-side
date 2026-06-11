import { LeanDocument, Types } from "mongoose";
import { ProductEntity } from "../../domain/product.entity";
import { ProductProps } from "../../domain/product.types";
import { ProductDescriptionVO } from "../../domain/value-objects/description/description.value-object";
import { ShortProductDescriptionVO } from "../../domain/value-objects/description/short-description.value-object";
import { PriceVO } from "../../domain/value-objects/price.value-object";
import { SeoMetaVO } from "../../domain/value-objects/seo-meta.value-object";
import { ProductSkuVO } from "../../domain/value-objects/sku.value-object";
import { SlugVO } from "../../domain/value-objects/slug.value-object";
import { EntityStatusVO } from "@/core/domain/value-objects/status.value-objects";
import { ProductVariantEntity } from "../../domain/variant-product.entity";
import { IProductDocument, IProductLean } from "../../types";
import { VariantProductFromPersistanceToEntity } from "./variant/db-to-variantEntity.mapper";
import { IProduct } from "../../types";

export class ProductFromPersistanceToEntityMapper {
  static fromPersistanceToEntity(
    dbData: IProductDocument | IProductLean
  ): ProductEntity {
    const props: ProductProps = {
      id: (dbData._id as Types.ObjectId).toString(),
      sku: new ProductSkuVO(dbData.sku),
      name: dbData.name,
      description: dbData.description
        ? new ProductDescriptionVO(dbData.description)
        : undefined,
      shortDescription: dbData.shortDescription
        ? new ShortProductDescriptionVO(dbData.shortDescription)
        : undefined,
      productOptions: dbData.productOptions,
      brand: dbData.brand?.toString(),
      categories: dbData.categories?.map((cat) => cat.toString()),
      tags: dbData.tags || [],
      images: dbData.images?.map((image) => ({
        id: image._id.toString(),
        url: image.url,
        alt: image.alt,
      })),
      price: dbData.price
        ? new PriceVO({
            amount: dbData.price.amount,
            currency: dbData.price.currency,
          })
        : undefined,
      costPrice: dbData.costPrice
        ? new PriceVO({
            amount: dbData.costPrice.amount,
            currency: dbData.costPrice.currency,
          })
        : undefined,
      compareAtPrice: dbData.compareAtPrice
        ? {
            original: new PriceVO({
              amount: dbData.compareAtPrice.original.amount,
              currency: dbData.compareAtPrice.original.currency,
            }),
            expiresAt: dbData.compareAtPrice.expiresAt,
          }
        : undefined,
      priceHistory: (dbData.priceHistory ?? []).map((entry) => ({
        price: new PriceVO({ amount: entry.price.amount, currency: entry.price.currency }),
        changedAt: entry.changedAt,
        changedBy: entry.changedBy,
      })),
      vatRate: dbData.vatRate,
      variants: dbData.variants?.map(
        VariantProductFromPersistanceToEntity.fromPersistanceToEntity
      ),
      isFeatured: dbData.isFeatured || false,
      status: new EntityStatusVO(dbData.status),
      ratings: dbData.ratings,
      reviewsCount: dbData.reviewsCount,
      seo: dbData.seo ? SeoMetaVO.fromDto(dbData.seo) : undefined,
      attributes: dbData.attributes,
      slug: new SlugVO(dbData.slug),

      statusHistory: (dbData.statusHistory ?? []).map((entry) => ({
        status: entry.status,
        changedAt: entry.changedAt,
        changedBy: entry.changedBy,
        reason: entry.reason,
      })),
      createdBy: dbData.createdBy.toHexString(),
      createdAt: dbData.createdAt,
      updatedAt: dbData.updatedAt,
    };

    return new ProductEntity(props);
  }
}
