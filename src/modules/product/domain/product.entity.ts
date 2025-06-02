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
  private readonly _description: ProductDescriptionVO;
  private _shortDescription?: ShortProductDescriptionVO;
  private _brand?: string;
  private readonly _categories: string[];
  private _tags?: string[];
  private readonly _images: ProductImage[];
  private _price: PriceVO;
  private _discount?: DiscountVO;
  private readonly _hasVariants: boolean;
  private _variants?: ProductVariantEntity[];
  private _isFeatured?: boolean;
  private _status: ProductStatus;
  private _ratings: RatingSummary;
  private _reviewsCount: number;
  private _seo?: SeoMetaVO;
  private _attributes?: AllUniqueKeyAndValuesFilters;
  private _slug: SlugVO;
  private _name: string;
  private _createdAt?: Date;
  private _updatedAt?: Date;
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
    this._hasVariants = props.hasVariants;
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
    if (this._hasVariants && !this._variants || this._variants?.length === 0) {
      throw new Error("Variant products must have at least one variant");
    }

    if (!this._hasVariants && this._variants && this._variants.length > 0) {
      throw new Error("Non-variant product cannot have variants");
    }

    if (this._price.amount <= 0) {
      throw new Error("Product price must be positive");
    }
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
}
