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

      discount: variant.discount ? toObjectId(variant.discount) : undefined,
      images: variant.images?.map((image) => ({
        _id: toObjectId(image.id),
        ...image,
        id: undefined,
      })),
    };
  }
}
