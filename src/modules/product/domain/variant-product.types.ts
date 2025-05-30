import { ProductImage } from "../types";
import { PriceVO } from "./value-objects/price.value-object";
import { ProductSkuVO } from "./value-objects/sku.value-object";

export interface VariantProductProps{
    id:string,
    sku:ProductSkuVO,
    productOptions: Map<string,string>,
    price?:PriceVO,
    images?:ProductImage[]
}