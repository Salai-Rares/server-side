import { ProductImage } from "../types";
import { PriceVO } from "./value-objects/price.value-object";
import { ProductSkuVO } from "./value-objects/sku.value-object";
import { VariantProductProps } from "./variant-product.types";

export class ProductVariantEntity {
  private readonly _id: string;
  private readonly _productOptions: Map<string, string>;
  private readonly _price?: PriceVO;
  private readonly _sku:ProductSkuVO;
  private readonly _images?:ProductImage[]
  constructor(props: VariantProductProps) {
    this._id = props.id;
    this._productOptions = props.productOptions;
    this._price = props.price;
    this._sku = props.sku;
    this._images = props.images
    this.validate();
  }
  get id(): string  {
    return this._id;
  }

  get productOptions(): ReadonlyMap<string, string> {
    return this._productOptions;
  }
  get price(): PriceVO | undefined {
    return this._price;
  }

  get sku(): ProductSkuVO {
    return this._sku;
  }
  get images(): ProductImage[] | undefined{
    return this._images
  }

  private validate(){
    if(this._productOptions.size <= 0 ){
      throw new Error("Options cannot be empty");
    }
  }
}
