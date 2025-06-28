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
import { EntityStatusVO } from "@/modules/shared/domain/value-objects/status.value-objects";
import { ProductVariantEntity } from "./variant-product.entity";
import {
  ProductDomainUpdateType,
  UpdateDiscountType,
  UpdatePriceType,
  UpdateSeoMetaType,

} from "../schemas";
import { newHexStringId } from "@/shared/utils";
import { ProductVariantMapper } from "../mappers/domain/variant/variantDto-to-entity.mapper";
import { ImageVO } from "./value-objects/image.value-object";
import slugify from "slugify";

export class ProductEntity implements ProductProps {
  private readonly _id: string;
  private readonly _sku: ProductSkuVO;
  private _description: ProductDescriptionVO;
  private _shortDescription?: ShortProductDescriptionVO;
  private _brand?: string;
  private _categories: string[];
  private _tags?: string[];
  private _images?: ImageVO[];
  private _price: PriceVO;
  private _discount?: DiscountVO;
  private _hasVariants: boolean;
  private _variants?: ProductVariantEntity[];
  private _isFeatured?: boolean;
  private _status: EntityStatusVO;
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
    this._variants = props.variants;
    this._hasVariants = this.calculateHasVariants();

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
  get images(): ImageVO[] | undefined {
    return this._images ? [...this._images] : undefined;
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
  get status(): EntityStatusVO {
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
    this._slug = SlugVO.fromName(this._name)
  }

  updateDescription(newDescription: string): void {
    if (this._status.isDeleted()) {
      throw ValidationError.domainRule(
        "description",
        "immutable_when_deleted",
        "Cannot update description of deleted product",
        this._id
      );
    }
    this._description = new ProductDescriptionVO(newDescription);
  }
  updateShortDescription(newShortDescription: string): void {
    if (this._status.isDeleted()) {
      throw ValidationError.domainRule(
        "shortDescription",
        "immutable_when_deleted",
        "Cannot update short description of deleted product",
        this._id
      );
    }

    this._shortDescription = new ShortProductDescriptionVO(newShortDescription);
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

  updateCategories(newCategories: string[]): void {
    if (this._status.isDeleted()) {
      throw ValidationError.domainRule(
        "categories",
        "immutable_when_deleted",
        "Cannot update categories of deleted product",
        this._id
      );
    }
    this._categories = [...newCategories];
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
  updateImages(newImages: []): void {
    if (this._status.isDeleted()) {
      throw ValidationError.domainRule(
        "images",
        "immutable_when_deleted",
        "Cannot update images of deleted product",
        this._id
      );
    }
    this._images = [...newImages];
  }
  updatePrice(priceUpdate: UpdatePriceType): void {
    if (this._status.isDeleted()) {
      throw ValidationError.domainRule(
        "price",
        "immutable_when_deleted",
        "Cannot update price of deleted product",
        this._id
      );
    }

    // Use current values if not provided
    const newAmount = priceUpdate.amount ?? this._price.amount;
    const newCurrency = priceUpdate.currency ?? this._price.currency;

    const newPrice = new PriceVO({ amount: newAmount, currency: newCurrency });

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

  updateDiscount(discountUpdate: UpdateDiscountType): void {
    if (this._status.isDeleted()) {
      throw ValidationError.domainRule(
        "discount",
        "immutable_when_deleted",
        "Cannot update discount of deleted product",
        this._id
      );
    }

    // Use current values if not provided (for partial updates)
    const newType = discountUpdate.type ?? this._discount?.type;
    const newValue = discountUpdate.value ?? this._discount?.value;
    const newValidUntil =
      discountUpdate.validUntil ?? this._discount?.validUntil;

    // Ensure we have required fields for creating the VO
    if (!newType || newValue === undefined) {
      throw ValidationError.domainRule(
        "discount",
        "missing_required_fields",
        "Discount type and value are required for update",
        this._id
      );
    }
    const newDiscount = new DiscountVO({
      type: newType,
      value: newValue,
      validUntil: newValidUntil,
    });

    // Business rule: Only validate fixed discounts against price
    if (newDiscount.type === "fixed") {
      if (newDiscount.value >= this._price.amount) {
        throw ValidationError.domainRule(
          "discount",
          "fixed_discount_exceeds_price",
          "Fixed discount cannot be equal to or greater than product price",
          {
            discountValue: newDiscount.value,
            productPrice: this._price.amount,
          }
        );
      }
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
  updateFeatured(isFeatured: boolean): void {
    if (this._status.isDeleted()) {
      throw ValidationError.domainRule(
        "isFeatured",
        "immutable_when_deleted",
        "Cannot update featured status of deleted product",
        this._id
      );
    }
    this._isFeatured = isFeatured;
  }

  clearFeatured(): void {
    if (this._status.isDeleted()) {
      throw ValidationError.domainRule(
        "isFeatured",
        "immutable_when_deleted",
        "Cannot clear featured status of deleted product",
        this._id
      );
    }
    this._isFeatured = undefined;
  }
  updateSeo(seoUpdate: UpdateSeoMetaType): void {
    if (this._status.isDeleted()) {
      throw ValidationError.domainRule(
        "seo",
        "immutable_when_deleted",
        "Cannot update SEO of deleted product",
        this._id
      );
    }

    if (this._seo) {
      const updatedSeoData = {
        title: seoUpdate.title ?? this._seo.title,
        description: seoUpdate.description
          ? new ShortProductDescriptionVO(seoUpdate.description)
          : this._seo.description,
        keywords: seoUpdate.keywords ?? this._seo.keywords,
        cannonicalUrl: seoUpdate.cannonicalUrl ?? this._seo.cannonicalUrl,
      };
      this._seo = new SeoMetaVO(updatedSeoData);
    } else {
      if (
        !seoUpdate.title ||
        !seoUpdate.description ||
        !seoUpdate.keywords ||
        !seoUpdate.cannonicalUrl
      ) {
        throw ValidationError.domainRule(
          "seo",
          "required_fields",
          "All SEO fields (title, description, keywords, cannonicalUrl) are required when creating new SEO",
          {
            provided: Object.keys(seoUpdate),
            missing: [
              !seoUpdate.title && "title",
              !seoUpdate.description && "description",
              !seoUpdate.keywords && "keywords",
              !seoUpdate.cannonicalUrl && "cannonicalUrl",
            ].filter(Boolean),
          }
        );
      }
      // All fields are guaranteed to be defined here
      this._seo = new SeoMetaVO({
        title: seoUpdate.title,
        description: new ShortProductDescriptionVO(seoUpdate.description),
        keywords: seoUpdate.keywords,
        cannonicalUrl: seoUpdate.cannonicalUrl,
      });
    }
  }

  clearSeo(): void {
    if (this._status.isDeleted()) {
      throw ValidationError.domainRule(
        "seo",
        "immutable_when_deleted",
        "Cannot clear SEO of deleted product",
        this._id
      );
    }
    this._seo = undefined;
  }

  updateAttributes(newAttributes: AllUniqueKeyAndValuesFilters): void {
    if (this._status.isDeleted()) {
      throw ValidationError.domainRule(
        "attributes",
        "immutable_when_deleted",
        "Cannot update attributes of deleted product",
        this._id
      );
    }
    this._attributes = newAttributes;
  }

  clearAttributes(): void {
    if (this._status.isDeleted()) {
      throw ValidationError.domainRule(
        "attributes",
        "immutable_when_deleted",
        "Cannot clear attributes of deleted product",
        this._id
      );
    }
    this._attributes = undefined;
  }

  removeImages(imageIds:string[]){
    this._images = this.images?.filter((image)=>!imageIds.includes(image.id))
  }

  addImage(image:ImageVO){
    this._images?.push(image)
  }
  reorderImages(order: string[]): void {
  if (!this._images) return;

  const imageMap = new Map(this._images.map((img) => [img.id, img]));
  const reordered: ImageVO[] = [];

  for (const id of order) {
    const img = imageMap.get(id);
    if (!img) {
      throw ValidationError.domainRule(
        "images",
        "invalid_reorder_id",
        `Cannot reorder images — image ID not found: ${id}`,
        { id, productId: this._id }
      );
    }
    reordered.push(img);
  }

  if (reordered.length !== this._images.length) {
    throw ValidationError.domainRule(
      "images",
      "incomplete_reorder",
      `Order must include all images. Received ${reordered.length}, expected ${this._images.length}`,
      { orderLength: order.length, imageCount: this._images.length }
    );
  }

  // Set primary: only first image
  for (let i = 0; i < reordered.length; i++) {
    reordered[i].isPrimary = i === 0;
  }

  this._images = reordered;
}

  updateMultiple(updates: ProductDomainUpdateType): void {
    if (updates.name !== undefined) {
      this.updateName(updates.name);
    }

    if (updates.description !== undefined) {
      this.updateDescription(updates.description);
    }

    if (updates.shortDescription !== undefined) {
      if (updates.shortDescription === null) {
        this.clearShortDescription();
      } else {
        this.updateShortDescription(updates.shortDescription);
      }
    }

    if (updates.brand !== undefined) {
      if (updates.brand === null) {
        this.clearBrand();
      } else {
        this.updateBrand(updates.brand);
      }
    }

    if (updates.tags !== undefined) {
      if (updates.tags === null) {
        this.clearTags();
      } else {
        this.updateTags(updates.tags);
      }
    }

    

    if (updates.price !== undefined) {
      this.updatePrice(updates.price);
    }

    if (updates.discount !== undefined) {
      if (updates.discount === null) {
        this.clearDiscount();
      } else {
        this.updateDiscount(updates.discount);
      }
    }

    if (updates.isFeatured !== undefined) {
      if (updates.isFeatured === null) {
        this.clearFeatured();
      } else {
        this.updateFeatured(updates.isFeatured);
      }
    }

    if (updates.seo !== undefined) {
      if (updates.seo === null) {
        this.clearSeo();
      } else {
        this.updateSeo(updates.seo);
      }
    }

    if (updates.attributes !== undefined) {
      if (updates.attributes === null) {
        this.clearAttributes();
      } else {
        this.updateAttributes(updates.attributes);
      }
    }
  }
}
