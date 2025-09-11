import { ValidationError } from "@/shared/errors/ValidationError";

import { ProductImage } from "../types";
import { PriceVO } from "./value-objects/price.value-object";
import { ProductSkuVO } from "./value-objects/sku.value-object";
import { VariantProductProps } from "./variant-product.types";
import { UpdatePriceType, VariantUpdateType } from "../schemas";
import { ImageVO } from "./value-objects/image.value-object";

export class ProductVariantEntity {
  private readonly _id: string;
  private _productOptions: Map<string, string>;
  private _price?: PriceVO;
  private readonly _sku: ProductSkuVO;
  private _images?: ImageVO[];
  constructor(props: VariantProductProps) {
    this._id = props.id;
    this._productOptions = props.productOptions;
    this._price = props.price;
    this._sku = props.sku;
    this._images = props.images;
    this.validate();
  }
  get id(): string {
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
  get images(): ImageVO[] | undefined {
    return this._images;
  }

  private validate() {
    if (this._productOptions.size <= 0) {
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
removeImages(imageIds: string[]) {
    
    this._images = this.images?.filter((image) => !imageIds.includes(image.id));

  }
  addImages(image: ImageVO[]): void {
    if (!this._images) {
      this._images = [];
    }
    this._images.push(...image);
  }
reorderImages(order: string[]): void {
  if (!this._images || this._images.length === 0) return;

  const uniqueOrderIds = new Set(order);

  // 1. Check for duplicate IDs in order
  if (uniqueOrderIds.size !== order.length) {
    throw ValidationError.domainRule(
      "images",
      "duplicate_ids_in_order",
      "Order contains duplicate image IDs",
      { order }
    );
  }

  // 2. Check for missing image IDs
  const missingIds: string[] = [];
  for (const img of this._images) {
    if (!uniqueOrderIds.has(img.id)) {
      missingIds.push(img.id);
    }
  }
  if (missingIds.length > 0) {
    throw ValidationError.domainRule(
      "images",
      "incomplete_reorder",
      `Order must include all current image IDs. Missing: ${missingIds.join(", ")}`,
      { orderLength: order.length, imageCount: this._images.length, missingIds }
    );
  }

  // 3. Reorder and validate each ID
  const imageMap = new Map(this._images.map((img) => [img.id, img]));
  const reordered: ImageVO[] = [];

  for (const id of order) {
    const img = imageMap.get(id);
    if (!img) {
      throw ValidationError.domainRule(
        "images",
        "invalid_reorder_id",
        `Order contains image ID not found in current images: ${id}`,
        { id, productId: this._id }
      );
    }
    reordered.push(img);
  }

  // 4. Set the primary image
  for (let i = 0; i < reordered.length; i++) {
    reordered[i].isPrimary = i === 0;
  }

  this._images = reordered;
}

  updateFromCommand(command:  Omit<VariantUpdateType, "images" | "inventory">) {
    if (this._id != command.id) {
      throw ValidationError.domainRule(
        "id",
        "id_format",
        "Id provided and variant id must be the same",
        { variantId: this._id }
      );
    }
    if (command.productOptions) {
      this.updateProductOptions(command.productOptions);
    }
    if (command.price !== undefined) {
      if (command.price === null) {
        this.clearPrice();
      } else {
        this.updatePrice(command.price);
      }
    }
  }

  getImagesLength(){
    return this._images?.length ?? 0;
  }
}
