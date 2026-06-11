import { ValidationError } from "@/shared/errors/ValidationError";
import {
  ProductImage,
  RatingSummary,
  VatRateType,
} from "../types";
import { AllUniqueKeyAndValuesFilters } from "../types/product-query-filter.types";
import { ProductProps, StatusHistoryEntryVO } from "./product.types";
import { EntityStatusType } from "@/core/domain/value-objects/status.value-objects";
import { ProductDescriptionVO } from "./value-objects/description/description.value-object";
import { ShortProductDescriptionVO } from "./value-objects/description/short-description.value-object";
import { PriceVO } from "./value-objects/price.value-object";
import { SeoMetaVO } from "./value-objects/seo-meta.value-object";
import { ProductSkuVO } from "./value-objects/sku.value-object";
import { SlugVO } from "./value-objects/slug.value-object";
import { EntityStatusVO } from "@/core/domain/value-objects/status.value-objects";
import { ProductVariantEntity } from "./variant-product.entity";
import {
  ProductDomainUpdateType,

  UpdatePriceType,
  UpdateSeoMetaType,
  VariantUpdateType,
} from "../schemas";

import { ProductVariantMapper } from "../mappers/domain/variant/variantDto-to-entity.mapper";
import { ImageVO } from "./value-objects/image.value-object";
import slugify from "slugify";
import { ChangeTracker } from "@/shared/services/change-tracker";
import { DataKeys } from "@/shared/types/data-keys-entities.types";
import { ApiError } from "@/shared/errors/api-error/ApiError";
import { isValidObjectId } from "mongoose";
type ReadonlyFields = "id" | "sku" | "createdAt" | "updatedAt";

export type UpdateableProductFields = Exclude<
  DataKeys<ProductEntity>,
  ReadonlyFields
>;

export class ProductEntity implements ProductProps {
  private changeTracker: ChangeTracker<ProductEntity, UpdateableProductFields> =
    new ChangeTracker();
  private readonly _id: string;
  private readonly _sku: ProductSkuVO;
  private _name: string;
  private _description?: ProductDescriptionVO;
  private _shortDescription?: ShortProductDescriptionVO;
  private _brand?: string;
  private _categories?: string[];
  private _tags?: string[];
  private _images?: ImageVO[];
  private _price?: PriceVO;
  private _costPrice?: PriceVO;
  private _compareAtPrice?: { original: PriceVO; expiresAt?: Date };
  private _priceHistory: { price: PriceVO; changedAt: Date; changedBy: string }[];
  private _vatRate?: VatRateType;
  private _hasVariants: boolean;
  private _variants?: ProductVariantEntity[];
  private _isFeatured?: boolean;
  private _status: EntityStatusVO;
  private _ratings: RatingSummary;
  private _reviewsCount: number;
  private _seo?: SeoMetaVO;
  private _attributes?: AllUniqueKeyAndValuesFilters;
  private _slug: SlugVO;

  private _productOptions?: ReadonlyMap<string, string>;
  private _statusHistory: StatusHistoryEntryVO[];

  private readonly _createdBy: string;
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
    this._costPrice = props.costPrice;
    this._compareAtPrice = props.compareAtPrice;
    this._priceHistory = props.priceHistory ?? [];
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
    this._statusHistory = props.statusHistory ?? [];
    this._createdBy = props.createdBy;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
    this.validate();
  }
  private validate(): void {
    if (this._variants && this._variants.length > 0) {
      this.validateVariantSkus(this._variants);
    }
    if (this._productOptions && this._productOptions.size <= 0) {
      throw ValidationError.domainRule(
        "productOptions",
        "list_non_empty",
        "Product options for main product can't be empty if it exists"
      );
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
  get description(): ProductDescriptionVO | undefined {
    return this._description;
  }
  get shortDescription(): ShortProductDescriptionVO | undefined {
    return this._shortDescription;
  }
  get brand(): string | undefined {
    return this._brand;
  }
  get categories(): string[] | undefined {
    return this._categories ? [...this._categories] : undefined;
  } // Return copy
  get tags(): string[] | undefined {
    return this._tags ? [...this._tags] : undefined;
  }
  get images(): ImageVO[] | undefined {
    return this._images ? [...this._images] : undefined;
  }
  get price(): PriceVO | undefined {
    return this._price;
  }
  get costPrice(): PriceVO | undefined {
    return this._costPrice;
  }
  get compareAtPrice(): { original: PriceVO; expiresAt?: Date } | undefined {
    return this._compareAtPrice;
  }
  get priceHistory(): { price: PriceVO; changedAt: Date; changedBy: string }[] {
    return [...this._priceHistory];
  }

  get vatRate(): VatRateType | undefined {
    return this._vatRate;
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
  get productOptions(): ReadonlyMap<string, string> | undefined {
    return this._productOptions;
  }
  get statusHistory(): StatusHistoryEntryVO[] {
    return [...this._statusHistory];
  }
  get createdBy(): string {
    return this._createdBy;
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
    this._slug = SlugVO.fromName(this._name);
    this.changeTracker.mark("name");
    this.changeTracker.mark("slug");
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
    this.changeTracker.mark("description");
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
    this.changeTracker.mark("shortDescription");
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
    this.changeTracker.mark("shortDescription");
  }
  updateProductOptions(newOptions: Record<string, string>): void {
    const newOptionsMap = new Map(Object.entries(newOptions));

    if (newOptionsMap.size <= 0) {
      throw ValidationError.domainRule(
        "productOptions",
        "empty_options",
        "Product options cannot be empty",
        this._id
      );
    }

    this._productOptions = newOptionsMap;
    this.changeTracker.mark("productOptions");
  }
  clearProductOptions(): void {
    if (this._status.isDeleted()) {
      throw ValidationError.domainRule(
        "productOptions",
        "immutable_when_deleted",
        "Cannot clear product options of deleted product",
        this._id
      );
    }
    this._productOptions = undefined;
    this.changeTracker.mark("productOptions");
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
    this.changeTracker.mark("brand");
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
    this.changeTracker.mark("brand");
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
    this.changeTracker.mark("categories");
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
    this.changeTracker.mark("tags");
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
    this.changeTracker.mark("tags");
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
    if (!this._price) {
      // If no price exists, we need both amount + currency to set a new one
      if (priceUpdate.amount === undefined || !priceUpdate.currency) {
        throw ValidationError.domainRule(
          "price",
          "missing_required_fields",
          "Both amount and currency are required to set initial price",
          { productId: this._id }
        );
      }
      this._price = new PriceVO({
        amount: priceUpdate.amount,
        currency: priceUpdate.currency,
      });
      this.changeTracker.mark("price");
      return;
    }
    // Otherwise, merge with existing price
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
    this.changeTracker.mark("price");
  }

  applyMarkdown(original: PriceVO, salePrice: PriceVO, changedBy: string, expiresAt?: Date): void {
    if (this._status.isDeleted()) {
      throw ValidationError.domainRule("compareAtPrice", "immutable_when_deleted", "Cannot apply markdown to deleted product", this._id);
    }
    if (salePrice.currency !== original.currency) {
      throw ValidationError.domainRule("compareAtPrice", "currency_mismatch", "Sale price and compare-at price must use the same currency", { saleCurrency: salePrice.currency, originalCurrency: original.currency });
    }
    if (salePrice.amount >= original.amount) {
      throw ValidationError.domainRule("compareAtPrice", "sale_price_not_lower", "Sale price must be lower than original price", { salePrice: salePrice.amount, original: original.amount });
    }
    this._compareAtPrice = { original, expiresAt };
    this._price = salePrice;
    this._priceHistory = [
      ...this._priceHistory.slice(-(20 - 1)),
      { price: salePrice, changedAt: new Date(), changedBy },
    ];
    this.changeTracker.mark("compareAtPrice");
    this.changeTracker.mark("price");
    this.changeTracker.mark("priceHistory");
  }

  removeMarkdown(changedBy: string): void {
    if (this._status.isDeleted()) {
      throw ValidationError.domainRule("compareAtPrice", "immutable_when_deleted", "Cannot remove markdown from deleted product", this._id);
    }
    if (!this._compareAtPrice) {
      throw ValidationError.domainRule("compareAtPrice", "no_markdown", "No active markdown to remove", this._id);
    }
    const restoredPrice = this._compareAtPrice.original;
    this._price = restoredPrice;
    this._priceHistory = [
      ...this._priceHistory.slice(-(20 - 1)),
      { price: restoredPrice, changedAt: new Date(), changedBy },
    ];
    this._compareAtPrice = undefined;
    this.changeTracker.mark("compareAtPrice");
    this.changeTracker.mark("price");
    this.changeTracker.mark("priceHistory");
  }

  transitionStatus(target: EntityStatusType, changedBy: string, reason?: string): void {
    this._status = this._status.transitionTo(target);
    this._statusHistory = [
      ...this._statusHistory.slice(-(50 - 1)),
      { status: target, changedAt: new Date(), changedBy, reason },
    ];
    this.changeTracker.mark("status");
    this.changeTracker.mark("statusHistory");
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
    this.changeTracker.mark("isFeatured");
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
    this.changeTracker.mark("isFeatured");
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
    this.changeTracker.mark("seo");
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
    this.changeTracker.mark("seo");
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
    this.changeTracker.mark("attributes");
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
    this.changeTracker.mark("attributes");
  }

  removeImages(imageIds: string[]) {
    if (this._status.isDeleted()) {
      throw ValidationError.domainRule(
        "images",
        "immutable_when_deleted",
        "Cannot remove images of deleted product",
        this._id
      );
    }
    this._images = this.images?.filter((image) => !imageIds.includes(image.id));
    this.changeTracker.mark("images");
  }

  addImage(image: ImageVO): void {
    if (this._status.isDeleted()) {
      throw ValidationError.domainRule(
        "images",
        "immutable_when_deleted",
        "Cannot add image to a deleted product",
        this._id
      );
    }

    if (!this._images) {
      this._images = [];
    }

    this._images.push(image);
    this.changeTracker.mark("images");
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

    this._images = reordered;
    this.changeTracker.mark("images");
  }

  updateMultiple(updates: ProductDomainUpdateType, changedBy: string): void {
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

    if (updates.productOptions !== undefined) {
      if (updates.productOptions === null) {
        this.clearProductOptions();
      } else {
        this.updateProductOptions(updates.productOptions);
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

    if (updates.compareAtPrice !== undefined) {
      if (updates.compareAtPrice === null) {
        this.removeMarkdown(changedBy);
        if (updates.price !== undefined) {
          this.updatePrice(updates.price);
        }
      } else {
        const originalPrice = new PriceVO(updates.compareAtPrice.original);
        let salePrice: PriceVO;
        if (updates.price !== undefined) {
          const amount = updates.price.amount ?? this._price?.amount;
          const currency = updates.price.currency ?? this._price?.currency;
          if (amount === undefined || !currency) {
            throw ValidationError.domainRule(
              "price",
              "missing_required_fields",
              "Both amount and currency are required for the sale price when applying a markdown",
              { productId: this._id }
            );
          }
          salePrice = new PriceVO({ amount, currency });
        } else if (this._price) {
          salePrice = this._price;
        } else {
          throw ValidationError.domainRule(
            "compareAtPrice",
            "missing_price",
            "A sale price is required to apply a markdown",
            { productId: this._id }
          );
        }
        this.applyMarkdown(originalPrice, salePrice, changedBy, updates.compareAtPrice.expiresAt);
      }
    } else if (updates.price !== undefined) {
      this.updatePrice(updates.price);
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

  public addVariant(variant: ProductVariantEntity) {
    if (this._status.isDeleted()) {
      throw ValidationError.domainRule(
        "variants",
        "immutable_when_deleted",
        "Cannot add variants to a deleted product",
        this._id
      );
    }
    if (!this._variants) {
      this._variants = [];
    }

    const skuAlreadExists = this._variants.some((vari) =>
      variant.sku.equals(vari.sku)
    );
    if (skuAlreadExists) {
      throw ValidationError.domainRule(
        "variants",
        "duplicate_sku",
        "Variant SKUs must be unique",
        { sku: variant.sku.value, productId: this._id }
      );
    }
    this._variants.push(variant);
    this._hasVariants = this._variants.length > 0;
    this.changeTracker.mark("variants");
    this.changeTracker.mark("hasVariants");
  }

  public removeVariants(variantIds: string[]): void {
    if (!this._variants || this._variants.length === 0) {
      throw ValidationError.domainRule(
        "variants",
        "no_variants_present",
        "Product has no variants to remove",
        this._id
      );
    }

    const existingIds = this._variants.map((v) => v.id);
    const missingIds = variantIds.filter((id) => !existingIds.includes(id));

    if (missingIds.length > 0) {
      throw ValidationError.domainRule(
        "variants",
        "not_found",
        "Some variant IDs do not exist on this product",
        { productId: this._id, missingIds }
      );
    }

    this._variants = this._variants.filter(
      (variant) => !variantIds.includes(variant.id)
    );

    this._hasVariants = this._variants.length > 0;
    this.changeTracker.mark("variants");
    this.changeTracker.mark("hasVariants");
  }

  public updateVariant(
    update: Omit<VariantUpdateType, "images" | "inventory">,
    imagesOperation?: { add?: ImageVO[]; remove?: string[]; order: string[] }
  ): void {
    if (!this._variants || this._variants.length === 0) {
      throw ValidationError.domainRule(
        "variants",
        "missing",
        "No variants exist on this product",
        this._id
      );
    }

    const variant = this._variants.find((v) => v.id === update.id);

    if (!variant) {
      throw ValidationError.domainRule(
        "variants",
        "not_found",
        `Variant with ID ${update.id} not found`,
        { productId: this._id, variantId: update.id }
      );
    }

    variant.updateFromCommand(update);
    if (imagesOperation) {
      const hasImagesOperations =
        (imagesOperation.add?.length ?? 0) > 0 ||
        (imagesOperation.remove?.length ?? 0) > 0;
      const hasOrder = (imagesOperation.order?.length ?? 0) > 0;
      if (hasImagesOperations && !hasOrder) {
        throw ValidationError.domainRule(
          "variants",
          "order_must_be_present",
          `Variant with id ${update.id} has image update requested but without order provided`
        );
      }

      if (imagesOperation.remove?.length) {
        variant.removeImages(imagesOperation.remove);
      }
      if (imagesOperation.add?.length) {
        variant.addImages(imagesOperation.add);
      }
      if (imagesOperation.order.length) {
        variant.reorderImages(imagesOperation.order);
      }
    }

    this.changeTracker.mark("variants");
  }

  public toUpdateObject() {
    if (!this.changeTracker.hasChanges()) {
      throw ApiError.badRequest(
        "You called update method but no changes were done"
      );
    }
    return this.changeTracker.toUpdate(this);
  }

  public getVariantById(id: string) {
    const foundVariant = this._variants?.find((variant) => variant.id === id);
    if (!foundVariant) {
      throw ValidationError.domainRule(
        "variants",
        "variant_id_must_exist",
        "could not find required variant",
        id
      );
    }
    return foundVariant;
  }
}
