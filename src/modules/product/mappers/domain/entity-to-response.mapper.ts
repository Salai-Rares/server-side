import { ProductEntity } from "../../domain/product.entity";
import { VariantProductEntityToResponseDtoMapper } from "./variant/entity-to-response.mapper";

export class ProductEntityToResponseDtoMapper {
  static toDto(entity: ProductEntity): Record<string, any> {
    return {
      id: entity.id,
      name: entity.name,
      slug: entity.slug.value,
      sku: entity.sku.value,
      description: entity.description?.toString() ?? null,
      shortDescription: entity.shortDescription?.toString() ?? null, // Optional
      productOptions: entity.productOptions ?? null,
      brand: entity.brand ?? null, // Optional ObjectId
      categories: entity.categories, // Required array
      tags: entity.tags ?? [],

      images:
        entity.images?.map((img) => ({
          id: img.id,
          url: img.url,
          alt: img.alt,
        })) ?? [],

      price: entity.price
        ? {
            amount: entity.price.amount,
            currency: entity.price.currency,
          }
        : null,
      costPrice: entity.costPrice
        ? {
            amount: entity.costPrice.amount,
            currency: entity.costPrice.currency,
          }
        : null,
      vatRate: entity.vatRate ?? null,

      hasVariants: entity.hasVariants, // Required boolean

      variants:
        entity.variants?.map(
          VariantProductEntityToResponseDtoMapper.variantToDto
        ) ?? [],

      isFeatured: entity.isFeatured ?? null, // Optional boolean
      status: entity.status.value, // Required

      ratings: {
        average: entity.ratings.average,
        count: entity.ratings.count,
        distribution: entity.ratings.distribution,
        percentageDistribution: entity.ratings.percentageDistribution ?? null,
      },

      reviewsCount: entity.reviewsCount, // Required

      seo: entity.seo
        ? {
            title: entity.seo.title,
            description: entity.seo.description.toString(),
            keywords: entity.seo.keywords,
            cannonicalUrl: entity.seo.cannonicalUrl,
          }
        : null, // Optional object

      attributes: entity.attributes ?? null, // Optional object

      publishedMetaData: entity.publishedMetaData
        ? {
            publishedAt: entity.publishedMetaData.publishedAt,
            publishedBy: entity.publishedMetaData.publishedBy,
          }
        : undefined,
      deletedMetaData: entity.deletedMetaData
        ? {
            deletedAt: entity.deletedMetaData.deletedAt,
            deletedBy: entity.deletedMetaData.deletedBy,
          }
        : undefined,
      archivedMetaData: entity.archivedMetaData
        ? {
            archivedAt: entity.archivedMetaData.archivedAt,
            archivedBy: entity.archivedMetaData.archivedBy,
          }
        : undefined,
      creatadBy: entity.createdBy ?? null,
      createdAt: entity.createdAt?.toISOString() ?? null,
      updatedAt: entity.updatedAt?.toISOString() ?? null,
    };
  }
}
