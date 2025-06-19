import { ValidationError } from "@/shared/errors/ValidationError";

import { ProductImage } from "../types";
import { PriceVO } from "./value-objects/price.value-object";
import { ProductSkuVO } from "./value-objects/sku.value-object";
import { VariantProductProps } from "./variant-product.types";
import { UpdatePriceType } from "../schemas";
import { ImageVO } from "./value-objects/image.value-object";

export class ProductVariantEntity {
  private readonly _id: string;
  private  _productOptions: Map<string, string>;
  private  _price?: PriceVO;
  private readonly _sku:ProductSkuVO;
  private  _images?:ImageVO[]
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
  get images(): ImageVO[] | undefined{
    return this._images
  }

  private validate(){
    if(this._productOptions.size <= 0 ){
      throw new Error("Options cannot be empty");
    }
  }
// =====================
  // Update Methods
  // =====================

  updateProductOptions(newOptions: Record<string, string>): void {
    const newOptionsMap = new Map(Object.entries(newOptions));
    
    if (newOptionsMap.size <= 0) {
      throw ValidationError.domainRule(
        "productOptions",
        "empty_options",
        "Product options cannot be empty",
        { variantId: this._id }
      );
    }

    this._productOptions = newOptionsMap;
  }

  updatePrice(priceUpdate: UpdatePriceType): void {
    if (!this._price && (!priceUpdate.amount || !priceUpdate.currency)) {
      throw ValidationError.domainRule(
        "price",
        "missing_required_fields",
        "Amount and currency are required when setting price for the first time",
        { variantId: this._id }
      );
    }

    const newAmount = priceUpdate.amount ?? this._price?.amount;
    const newCurrency = priceUpdate.currency ?? this._price?.currency;

    if (newAmount !== undefined && newCurrency) {
      this._price = new PriceVO({ amount: newAmount, currency: newCurrency });
    }
  }

  clearPrice(): void {
    this._price = undefined;
  }

  updateImages(newImages: ImageVO[]): void {
    this._images = newImages.length > 0 ? [...newImages] : undefined;
  }

  clearImages(): void {
    this._images = undefined;
  }

}
