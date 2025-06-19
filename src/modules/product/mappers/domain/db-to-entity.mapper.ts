import { LeanDocument, Types } from "mongoose";
import { ProductEntity } from "../../domain/product.entity";
import { ProductProps } from "../../domain/product.types";
import { ProductDescriptionVO } from "../../domain/value-objects/description/description.value-object";
import { ShortProductDescriptionVO } from "../../domain/value-objects/description/short-description.value-object";
import { DiscountVO } from "../../domain/value-objects/discount.value-object";
import { PriceVO } from "../../domain/value-objects/price.value-object";
import { SeoMetaVO } from "../../domain/value-objects/seo-meta.value-object";
import { ProductSkuVO } from "../../domain/value-objects/sku.value-object";
import { SlugVO } from "../../domain/value-objects/slug.value-object";
import { ProductStatus } from "../../domain/value-objects/status.value-object";
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
      description: new ProductDescriptionVO(dbData.description),
      shortDescription: dbData.shortDescription
        ? new ShortProductDescriptionVO(dbData.shortDescription)
        : undefined,
      brand: dbData.brand?.toString(),
      categories: dbData.categories.map((cat) => cat.toString()),
      tags: dbData.tags || [],
      images: dbData.images?.map((image) => ({
        ...image,
        id: image._id.toString(),
        _id: undefined,
      })),
      price: new PriceVO({
        amount: dbData.price.amount,
        currency: dbData.price.currency,
      }),
      discount: dbData.discount ? new DiscountVO(dbData.discount) : undefined,
      variants: dbData.variants?.map(
        VariantProductFromPersistanceToEntity.fromPersistanceToEntity
      ),
      isFeatured: dbData.isFeatured || false,
      status: new ProductStatus(dbData.status),
      ratings: dbData.ratings,
      reviewsCount: dbData.reviewsCount,
      seo: dbData.seo ? SeoMetaVO.fromDto(dbData.seo) : undefined,
      attributes: dbData.attributes,
      slug: new SlugVO(dbData.slug),
      createdAt: dbData.createdAt,
      updatedAt: dbData.updatedAt,
    };

    return new ProductEntity(props);
  }
}
