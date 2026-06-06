import { SlugVO } from "@/modules/product/domain/value-objects/slug.value-object";
import { PriceVO } from "../../../domain/value-objects/price.value-object";
import { ProductSkuVO } from "../../../domain/value-objects/sku.value-object";
import { ProductVariantEntity } from "../../../domain/variant-product.entity";
import { VariantProductProps } from "../../../domain/variant-product.types";
import { ProductVariant } from "../../../types";

export class VariantProductFromPersistanceToEntity {
  static fromPersistanceToEntity(raw: ProductVariant): ProductVariantEntity {
    // Prepare props for the entity
    const props: VariantProductProps = {
      id: raw._id.toString(),
      name: raw.name,
      slug: new SlugVO(raw.slug),
      sku: new ProductSkuVO(raw.sku),
      productOptions: raw.productOptions,
      ...(raw.price && { price: new PriceVO(raw.price) }),
      images: raw.images?.map((image) => ({
        id: image._id.toString(),
        url: image.url,

        alt: image.alt,
      })),
    };

    return new ProductVariantEntity(props);
  }
}
