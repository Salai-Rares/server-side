import { ProductVariantEntity } from "@/modules/product/domain/variant-product.entity";
import { ProductVariant } from "@/modules/product/types";
import { toObjectId } from "@/shared/utils";

export class VariantEntityToDbMapper {
  static variantEntityToModel(variant: ProductVariantEntity): ProductVariant {
    return {
      _id: toObjectId(variant.id),
      sku: variant.sku.toString(),
      productOptions: variant.productOptions as Readonly<Map<string, string>>,
      price: variant.price,
      images: variant.images?.map((image) => ({
        _id: toObjectId(image.id),
        ...image,
        id: undefined,
      })),
    };
  }
}
