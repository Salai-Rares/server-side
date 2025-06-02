import { ValidationError } from "@/shared/errors/ValidationError";

export class ProductSkuVO {
  private readonly _value: string;

  constructor(sku: string) {
    this.validateSku(sku);
    this._value = sku.toUpperCase(); // Ensure consistent uppercase
  }

  private validateSku(sku: string): void {
    const errors: Array<{field: string, rule: string, message: string, value?: any}> = [];

    // Basic validation
    if (!sku || typeof sku !== 'string') {
      errors.push({
        field: 'sku',
        rule: 'required',
        message: 'SKU is required',
        value: sku
      });
    } else {
      const trimmedSku = sku.trim();
      
      if (!trimmedSku) {
        errors.push({
          field: 'sku',
          rule: 'not_empty',
          message: 'SKU cannot be empty',
          value: sku
        });
      } else {
        // Format validation
        if (!/^[A-Z]{2,4}-[A-Z0-9]{2,10}(-[A-Z0-9]{2,10}){0,2}$/i.test(trimmedSku)) {
          errors.push({
            field: 'sku',
            rule: 'format',
            message: 'SKU must follow format: {CATEGORY}-{TYPE}-{ID}[-VARIANT] (e.g., TOOL-CHAIN-X20)',
            value: sku
          });
        }

        // Length validation
        if (trimmedSku.length > 30) {
          errors.push({
            field: 'sku',
            rule: 'max_length',
            message: 'SKU cannot exceed 30 characters',
            value: { provided: trimmedSku.length, maximum: 30 }
          });
        }

        // Character validation
        if (!/^[A-Z0-9-]+$/i.test(trimmedSku)) {
          errors.push({
            field: 'sku',
            rule: 'allowed_characters',
            message: 'SKU can only contain letters, numbers, and hyphens',
            value: sku
          });
        }

        // Structure validation
        this.validateSkuStructure(trimmedSku, errors);
      }
    }

    if (errors.length > 0) {
      throw ValidationError.domainRules("Invalid SKU format", errors);
    }
  }

  private validateSkuStructure(sku: string, errors: Array<{field: string, rule: string, message: string, value?: any}>): void {
    const parts = sku.split('-');

    // Must have at least 3 parts (CATEGORY-TYPE-ID)
    if (parts.length < 3) {
      errors.push({
        field: 'sku',
        rule: 'minimum_parts',
        message: 'SKU must have at least 3 parts: CATEGORY-TYPE-ID',
        value: { provided: parts.length, minimum: 3, parts }
      });
      return;
    }

    // Maximum 4 parts (CATEGORY-TYPE-ID-VARIANT)
    if (parts.length > 4) {
      errors.push({
        field: 'sku',
        rule: 'maximum_parts',
        message: 'SKU cannot have more than 4 parts',
        value: { provided: parts.length, maximum: 4, parts }
      });
      return;
    }

    // Validate each part
    this.validateSkuPart(parts[0], 'category', 2, 4, errors);
    this.validateSkuPart(parts[1], 'type', 2, 10, errors);
    this.validateSkuPart(parts[2], 'id', 2, 10, errors);
    
    if (parts[3]) {
      this.validateSkuPart(parts[3], 'variant', 2, 10, errors);
    }
  }

  private validateSkuPart(
    part: string, 
    partName: string, 
    minLength: number, 
    maxLength: number, 
    errors: Array<{field: string, rule: string, message: string, value?: any}>
  ): void {
    if (!part) {
      errors.push({
        field: 'sku',
        rule: `${partName}_required`,
        message: `SKU ${partName} part cannot be empty`,
        value: part
      });
      return;
    }

    if (part.length < minLength) {
      errors.push({
        field: 'sku',
        rule: `${partName}_min_length`,
        message: `SKU ${partName} must be at least ${minLength} characters`,
        value: { provided: part.length, minimum: minLength, part }
      });
    }

    if (part.length > maxLength) {
      errors.push({
        field: 'sku',
        rule: `${partName}_max_length`,
        message: `SKU ${partName} cannot exceed ${maxLength} characters`,
        value: { provided: part.length, maximum: maxLength, part }
      });
    }

    // Category should be only letters
    if (partName === 'category' && !/^[A-Z]+$/i.test(part)) {
      errors.push({
        field: 'sku',
        rule: 'category_letters_only',
        message: 'SKU category must contain only letters',
        value: part
      });
    }

    // Type, ID, and variant can contain letters and numbers
    if (['type', 'id', 'variant'].includes(partName) && !/^[A-Z0-9]+$/i.test(part)) {
      errors.push({
        field: 'sku',
        rule: `${partName}_alphanumeric`,
        message: `SKU ${partName} must contain only letters and numbers`,
        value: part
      });
    }
  }

  // Getters
  get value(): string {
    return this._value;
  }

  get category(): string {
    return this._value.split('-')[0];
  }

  get type(): string {
    return this._value.split('-')[1];
  }

  get id(): string {
    return this._value.split('-')[2];
  }

  get variant(): string | undefined {
    const parts = this._value.split('-');
    return parts[3] || undefined;
  }

  get parts(): { category: string; type: string; id: string; variant?: string } {
    const parts = this._value.split('-');
    return {
      category: parts[0],
      type: parts[1], 
      id: parts[2],
      ...(parts[3] && { variant: parts[3] })
    };
  }

  // Utility methods
  hasVariant(): boolean {
    return this._value.split('-').length === 4;
  }

  equals(other: ProductSkuVO): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  // Static factory methods
  static create(category: string, type: string, id: string, variant?: string): ProductSkuVO {
    const skuParts = [category, type, id];
    if (variant) {
      skuParts.push(variant);
    }
    return new ProductSkuVO(skuParts.join('-'));
  }

  static fromString(sku: string): ProductSkuVO {
    return new ProductSkuVO(sku);
  }

  // Business logic methods
  generateVariantSku(variantCode: string): ProductSkuVO {
    if (this.hasVariant()) {
      throw ValidationError.domainRule(
        'sku',
        'already_has_variant',
        'Cannot add variant to SKU that already has a variant',
        { currentSku: this._value, variantCode }
      );
    }

    return new ProductSkuVO(`${this._value}-${variantCode}`);
  }

  getBaseSku(): ProductSkuVO {
    if (!this.hasVariant()) {
      return this; // Already a base SKU
    }

    const parts = this._value.split('-');
    return new ProductSkuVO(parts.slice(0, 3).join('-'));
  }
}