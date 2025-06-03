import { ValidationError } from "@/shared/errors/ValidationError";
import { ProductImage, RatingSummary } from "../types";
import { AllUniqueKeyAndValuesFilters } from "../types/product-query-filter.types";
import { ProductProps } from "./product.types";
import { ProductDescriptionVO } from "./value-objects/description/description.value-object";
import { ShortProductDescriptionVO } from "./value-objects/description/short-description.value-object";
import { DiscountVO } from "./value-objects/discount.value-object";
import { PriceVO } from "./value-objects/price.value-object";
import { SeoMetaVO } from "./value-objects/seo-meta.value-object";
import { ProductSkuVO } from "./value-objects/sku.value-object";
import { SlugVO } from "./value-objects/slug.value-object";
import { ProductStatus } from "./value-objects/status.value-object";
import { ProductVariantEntity } from "./variant-product.entity";

export class ProductEntity implements ProductProps {
  private readonly _id: string;
  private readonly _sku: ProductSkuVO;
  private _description: ProductDescriptionVO;
  private _shortDescription?: ShortProductDescriptionVO;
  private _brand?: string;
  private _categories: string[];
  private _tags?: string[];
  private _images: ProductImage[];
  private _price: PriceVO;
  private _discount?: DiscountVO;
  private _hasVariants: boolean;
  private _variants?: ProductVariantEntity[];
  private _isFeatured?: boolean;
  private _status: ProductStatus;
  private _ratings: RatingSummary;
  private _reviewsCount: number;
  private _seo?: SeoMetaVO;
  private _attributes?: AllUniqueKeyAndValuesFilters;
  private _slug: SlugVO;
  private _name: string;
  private readonly _createdAt?: Date;
  private readonly _updatedAt?: Date;
  constructor(props: ProductProps) {
    this._id = props.id;
    this._sku = props.sku;
    this._description = props.description;
    this._shortDescription = props.shortDescription;
    this._brand = props.brand;
    this._categories = props.categories;
    this._tags = props.tags;
    this._images = props.images;
    this._price = props.price;
    this._discount = props.discount;
    this._hasVariants = this.calculateHasVariants();
    this._variants = props.variants;
    this._isFeatured = props.isFeatured;
    this._status = props.status;
    this._ratings = props.ratings;
    this._reviewsCount = props.reviewsCount;
    this._seo = props.seo;
    this._attributes = props.attributes;
    this._slug = props.slug;
    this._name = props.name;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
    this.validate();
  }
  private validate(): void {
    if (this._variants && this._variants.length > 0) {
      this.validateVariantSkus(this._variants);
    }
  }

  private validateVariantSkus(variants: ProductVariantEntity[]): void {
    const skus = new Set<string>();
    for (const variant of variants) {
      if (skus.has(variant.sku.value)) {
        throw ValidationError.domainRule(
          "variants",
          "duplicate_sku",
          "Variant SKUs must be unique",
          { sku: variant.sku.value, productId: this._id }
        );
      }
      skus.add(variant.sku.value);
    }
  }

  private calculateHasVariants(): boolean {
    return !!(this._variants && this._variants.length > 0);
  }
  // =====================
  // Getters (Read-only)
  // =====================
  get id(): string {
    return this._id;
  }
  get sku(): ProductSkuVO {
    return this._sku;
  }
  get description(): ProductDescriptionVO {
    return this._description;
  }
  get shortDescription(): ShortProductDescriptionVO | undefined {
    return this._shortDescription;
  }
  get brand(): string | undefined {
    return this._brand;
  }
  get categories(): string[] {
    return [...this._categories];
  } // Return copy
  get tags(): string[] | undefined {
    return this._tags ? [...this._tags] : undefined;
  }
  get images(): ProductImage[] {
    return [...this._images];
  }
  get price(): PriceVO {
    return this._price;
  }
  get discount(): DiscountVO | undefined {
    return this._discount;
  }
  get hasVariants(): boolean {
    return this._hasVariants;
  }
  get variants(): ProductVariantEntity[] | undefined {
    return this._variants ? [...this._variants] : undefined;
  }
  get isFeatured(): boolean | undefined {
    return this._isFeatured;
  }
  get status(): ProductStatus {
    return this._status;
  }
  get ratings(): RatingSummary {
    return { ...this._ratings };
  }
  get reviewCount(): number {
    return this._reviewsCount;
  }
  get seo(): SeoMetaVO | undefined {
    return this._seo;
  }
  get attributes(): AllUniqueKeyAndValuesFilters | undefined {
    return this._attributes;
  }
  get slug(): SlugVO {
    return this._slug;
  }
  get reviewsCount(): number {
    return this._reviewsCount;
  }
  get name(): string {
    return this._name;
  }
  get createdAt(): Date | undefined {
    return this._createdAt;
  }
  get updatedAt(): Date | undefined {
    return this._updatedAt;
  }

  updateName(newName: string): void {
    // Business rule: Can't change name if product is deleted
    if (this._status.isDeleted()) {
      throw ValidationError.domainRule(
        "name",
        "immutable_when_deleted",
        "Cannot update name of deleted product",
        this._id
      );
    }
    this._name = newName.trim();
  }

  updateDescription(newDescription: ProductDescriptionVO): void {
    if (this._status.isDeleted()) {
      throw ValidationError.domainRule(
        "description",
        "immutable_when_deleted",
        "Cannot update description of deleted product",
        this._id
      );
    }
    this._description = newDescription;
  }
  updateShortDescription(newShortDescription: ShortProductDescriptionVO): void {
    if (this._status.isDeleted()) {
      throw ValidationError.domainRule(
        "shortDescription",
        "immutable_when_deleted",
        "Cannot update short description of deleted product",
        this._id
      );
    }

    this._shortDescription = newShortDescription;
  }
  clearShortDescription(): void {
    if (this._status.isDeleted()) {
      throw ValidationError.domainRule(
        "shortDescription",
        "immutable_when_deleted",
        "Cannot clear short description of deleted product",
        this._id
      );
    }

    this._shortDescription = undefined;
  }

  updateBrand(newBrand: string): void {
    if (this._status.isDeleted()) {
      throw ValidationError.domainRule(
        "brand",
        "immutable_when_deleted",
        "Cannot update brand of deleted product",
        this._id
      );
    }

    this._brand = newBrand;
  }

  clearBrand(): void {
    if (this._status.isDeleted()) {
      throw ValidationError.domainRule(
        "brand",
        "immutable_when_deleted",
        "Cannot clear brand of deleted product",
        this._id
      );
    }

    this._brand = undefined;
  }

  updateTags(newTags: string[]): void {
    if (this._status.isDeleted()) {
      throw ValidationError.domainRule(
        "tags",
        "immutable_when_deleted",
        "Cannot update tags of deleted product",
        this._id
      );
    }

    // Zod already validated and processed the tags array
    this._tags = newTags;
  }

  clearTags(): void {
    if (this._status.isDeleted()) {
      throw ValidationError.domainRule(
        "tags",
        "immutable_when_deleted",
        "Cannot clear tags of deleted product",
        this._id
      );
    }

    this._tags = undefined;
  }

  updatePrice(newPrice: PriceVO): void {
    if (this._status.isDeleted()) {
      throw ValidationError.domainRule(
        "price",
        "immutable_when_deleted",
        "Cannot update price of deleted product",
        this._id
      );
    }
    // Business rule: Large price changes on active products might need approval
    if (this._status.isActive()) {
      const changePercentage =
        Math.abs(newPrice.amount - this._price.amount) / this._price.amount;
      if (changePercentage > 0.2) {
        // 20% threshold
        throw ValidationError.domainRule(
          "price",
          "large_change_requires_approval",
          "Price changes >20% on active products require approval workflow",
          {
            productId: this._id,
            currentPrice: this._price.amount,
            requestedPrice: newPrice.amount,
            changePercentage: Math.round(changePercentage * 100),
          }
        );
      }
    }

    this._price = newPrice;
  }

  updateDiscount(newDiscount: DiscountVO): void {
    if (this._status.isDeleted()) {
      throw ValidationError.domainRule(
        "discount",
        "immutable_when_deleted",
        "Cannot update discount of deleted product",
        this._id
      );
    }

    // Business rule: Discount cannot be greater than price
    const discountAmount =
      newDiscount.type === "percentage"
        ? (this._price.amount * newDiscount.value) / 100
        : newDiscount.value;

    if (discountAmount >= this._price.amount) {
      throw ValidationError.domainRule(
        "discount",
        "cannot_exceed_price",
        "Discount cannot be equal to or greater than product price",
        { discount: discountAmount, price: this._price.amount }
      );
    }

    this._discount = newDiscount;
  }

  clearDiscount(): void {
    if (this._status.isDeleted()) {
      throw ValidationError.domainRule(
        "discount",
        "immutable_when_deleted",
        "Cannot clear discount of deleted product",
        this._id
      );
    }

    this._discount = undefined;
  }

  updateVariants(newVariants: ProductVariantEntity[]): void {
    if (this._status.isDeleted()) {
      throw ValidationError.domainRule(
        "variants",
        "immutable_when_deleted",
        "Cannot update variants of deleted product",
        this._id
      );
    }

    // Validate variant SKUs are unique (if any variants provided)
    if (newVariants.length > 0) {
      this.validateVariantSkus(newVariants);
    }

    // Update variants
    this._variants = newVariants.length > 0 ? newVariants : undefined;

    // Auto-recalculate hasVariants
    this._hasVariants = this.calculateHasVariants();
  }

   clearVariants(): void {
    if (this._status.isDeleted()) {
      throw ValidationError.domainRule('variants', 'immutable_when_deleted', 
        'Cannot clear variants of deleted product', this._id);
    }

    this._variants = undefined;
    this._hasVariants = false; // Auto-update
  }
}
