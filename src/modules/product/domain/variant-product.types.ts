import { ProductImage, VatRateType } from "../types";
import { ImageVO } from "./value-objects/image.value-object";
import { PriceVO } from "./value-objects/price.value-object";
import { ProductSkuVO } from "./value-objects/sku.value-object";
import { SlugVO } from "./value-objects/slug.value-object";

export interface VariantProductProps {
  id: string;
  name: string;
  sku: ProductSkuVO;
  slug: SlugVO;
  productOptions?: ReadonlyMap<string, string>;
  price?: PriceVO;
  costPrice?: PriceVO;
  vatRate?: VatRateType;
  discount?: string;
  images?: ImageVO[];
}
