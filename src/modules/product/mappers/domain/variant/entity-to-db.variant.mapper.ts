import { ProductVariantEntity } from "@/modules/product/domain/variant-product.entity";
import { ProductVariant } from "@/modules/product/types";
import { toObjectId } from "@/shared/utils";

export class VariantEntityToDbMapper {
  static variantEntityToModel(variant: ProductVariantEntity): ProductVariant {
    return {
      _id: toObjectId(variant.id),
      name: variant.name,
      slug: variant.slug.value,
      sku: variant.sku.toString(),
      productOptions: variant.productOptions,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice
        ? {
            original: {
              amount: variant.compareAtPrice.original.amount,
              currency: variant.compareAtPrice.original.currency,
            },
            expiresAt: variant.compareAtPrice.expiresAt,
          }
        : undefined,
      priceHistory: variant.priceHistory.map((entry) => ({
        price: { amount: entry.price.amount, currency: entry.price.currency },
        changedAt: entry.changedAt,
        changedBy: entry.changedBy,
      })),
      images: variant.images?.map((image) => ({
        _id: toObjectId(image.id),
        ...image,
        id: undefined,
      })),
    };
  }
}
