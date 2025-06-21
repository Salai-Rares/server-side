import { ProductVariantEntity } from "@/modules/product/domain/variant-product.entity";

export class VariantProductEntityToResponseDtoMapper {
  static variantToDto(variant: ProductVariantEntity): Record<string, any> {
    return {
      id: variant.id,
      sku: variant.sku.value,
      productOptions: Object.fromEntries(variant.productOptions.entries()),
      price: variant.price
        ? {
            amount: variant.price.amount,
            currency: variant.price.currency,
          }
        : null,
      images:
        variant.images?.map((img) => ({
          id: img.id,
          url: img.url,
          alt: img.alt,
          isPrimary: img.isPrimary,
        })) ?? null,
    };
  }
}
