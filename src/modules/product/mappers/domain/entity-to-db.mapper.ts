import { toObjectId } from "@/shared/utils";
import { ProductEntity } from "../../domain/product.entity";
import { IProduct } from "../../types";
import { id } from "inversify";
import { VariantEntityToDbMapper } from "./variant/entity-to-db.variant.mapper";

export class ProductEntityToPersistanceMapper {
  static mapToPersistence(
    entity: ProductEntity
  ): Omit<IProduct, "createdAt" | "updatedAt"> {
    return {
      _id: toObjectId(entity.id),
      sku: entity.sku.value,
      name: entity.name,
      slug: entity.slug.value,
      description: entity.description.toString(),
      shortDescription: entity.shortDescription?.toString(),
      brand: entity.brand ? toObjectId(entity.brand) : undefined,
      categories: entity.categories.map((id) => toObjectId(id)),
      tags: entity.tags,
      images: entity.images?.map((image) => ({
        ...image,
        _id: toObjectId(image.id),
        id: undefined,
      })),
      price: {
        amount: entity.price.amount,
        currency: entity.price.currency,
      },
      discount: entity.discount,
      hasVariants: entity.hasVariants,
      variants: entity.variants?.map(VariantEntityToDbMapper.variantEntityToModel),
      isFeatured: entity.isFeatured,
      status: entity.status.value,
      ratings: entity.ratings,
      reviewsCount: entity.reviewCount,
      seo: entity.seo
        ? {
            title: entity.seo.title,
            cannonicalUrl: entity.seo.cannonicalUrl,
            description: entity.seo.description.toString(),
            keywords: entity.seo.keywords,
          }
        : undefined,
      attributes: entity.attributes,
    };
  }
}
