import { toObjectId } from "@/shared/utils";
import {
  ProductEntity,
  UpdateableProductFields,
} from "../../domain/product.entity";
import { IProduct } from "../../types";
import { id } from "inversify";
import { VariantEntityToDbMapper } from "./variant/entity-to-db.variant.mapper";
import { E } from "@faker-js/faker/dist/airline-BUL6NtOJ";

export class ProductEntityToPersistanceMapper {
  static mapToPersistence(
    entity: ProductEntity
  ): Omit<IProduct, "createdAt" | "updatedAt"> {
    return {
      _id: toObjectId(entity.id),
      sku: entity.sku.value,
      name: entity.name,
      slug: entity.slug.value,
      description: entity.description?.toString(),
      shortDescription: entity.shortDescription?.toString(),
      productOptions: entity.productOptions,
      brand: entity.brand ? toObjectId(entity.brand) : undefined,
      categories: entity.categories?.map((id) => toObjectId(id)),
      tags: entity.tags,
      images: entity.images?.map((image) => ({
        ...image,
        _id: toObjectId(image.id),
        id: undefined,
      })),
      price: entity.price
        ? {
            amount: entity.price.amount,
            currency: entity.price.currency,
          }
        : undefined,
      costPrice: entity.costPrice
        ? {
            amount: entity.costPrice.amount,
            currency: entity.costPrice.currency,
          }
        : undefined,
      discount: entity.discount ? toObjectId(entity.discount) : undefined,
      hasVariants: entity.hasVariants,
      variants: entity.variants?.map(
        VariantEntityToDbMapper.variantEntityToModel
      ),
      isFeatured: entity.isFeatured,
      status: entity.status.value,
      ratings: entity.ratings,
      reviewsCount: entity.reviewsCount,
      seo: entity.seo
        ? {
            title: entity.seo.title,
            cannonicalUrl: entity.seo.cannonicalUrl,
            description: entity.seo.description.toString(),
            keywords: entity.seo.keywords,
          }
        : undefined,
      attributes: entity.attributes,
      createdBy: entity.createdBy ? toObjectId(entity.createdBy) : undefined,
      publishedMetaData: entity.publishedMetaData
        ? {
            publishedAt: entity.publishedMetaData.publishedAt,
            publishedBy: toObjectId(entity.publishedMetaData.publishedBy),
          }
        : undefined,
      deletedMetaData: entity.deletedMetaData
        ? {
            deletedAt: entity.deletedMetaData.deletedAt,
            deletedBy: toObjectId(entity.deletedMetaData.deletedBy),
          }
        : undefined,
      archivedMetaData: entity.archivedMetaData
        ? {
            archivedAt: entity.archivedMetaData.archivedAt,
            archivedBy: toObjectId(entity.archivedMetaData.archivedBy),
          }
        : undefined,
    };
  }
  static mapPartialToPersistence(
    entity: ProductEntity,
    updatedFields: Partial<Pick<ProductEntity, UpdateableProductFields>>
  ): Partial<IProduct> {
    const fullMapped = this.mapToPersistence(entity);
    const output: Record<string, unknown> = {};
    for (const key of Object.keys(updatedFields)) {
      output[key] = fullMapped[key as keyof typeof fullMapped];
    }
    return output;
  }
}
