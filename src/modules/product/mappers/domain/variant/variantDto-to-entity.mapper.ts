import { PriceVO } from "../../../domain/value-objects/price.value-object";
import { ProductSkuVO } from "../../../domain/value-objects/sku.value-object";
import { VariantProductProps } from "../../../domain/variant-product.types";
import { VariantBaseType, VariantWithInventoryType } from "../../../schemas";

// variant.mapper.ts
export class ProductVariantMapper {
  static toDomain(
    raw: VariantBaseType
  ): Omit<VariantProductProps, "id" | "images" | "slug"> {
    return {
      name: raw.name,
      sku: new ProductSkuVO(raw.sku),
      productOptions: raw.productOptions
        ? new Map(Object.entries(raw.productOptions))
        : undefined,
      price: raw.price ? new PriceVO(raw.price) : undefined,
      costPrice: raw.costPrice ? new PriceVO(raw.costPrice) : undefined,
      vatRate: raw.vatRate,
    };
  }

  static extractBaseProperties(raw: VariantWithInventoryType): VariantBaseType {
    return {
      sku: raw.sku,
      productOptions: raw.productOptions,
      price: raw.price,
      costPrice: raw.costPrice,
      vatRate: raw.vatRate,
      images: raw.images,
      name: raw.name,
    };
  }
}
