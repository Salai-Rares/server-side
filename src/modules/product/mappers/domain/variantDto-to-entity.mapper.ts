import { PriceVO } from "../../domain/value-objects/price.value-object";
import { ProductSkuVO } from "../../domain/value-objects/sku.value-object";
import { VariantProductProps } from "../../domain/variant-product.types";
import { VariantBaseType, VariantWithInventoryType } from "../../schemas";

// variant.mapper.ts
export class ProductVariantMapper {
  static toDomain(raw: VariantBaseType): Omit<VariantProductProps,"id"> {
    return {
      sku: new ProductSkuVO(raw.sku),
      productOptions: new Map(Object.entries(raw.productOptions)),
      price: raw.price ? new PriceVO(raw.price) : undefined,
      images:raw.images
    };
  }

  static extractBaseProperties(raw: VariantWithInventoryType): VariantBaseType {
    return {
      sku: raw.sku,
      productOptions: raw.productOptions,
      price: raw.price,
      images:raw.images
    };
  }
}