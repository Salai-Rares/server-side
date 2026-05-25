import { ValidationError, ValidationField } from "@/shared/errors/ValidationError";
import { TYPES } from "@/shared/types";
import { inject, injectable } from "inversify";
import { IProductRepositoryRead } from "../types/read/product-read.repository.types";
import { ProductEntity } from "../domain/product.entity";
import { ProductVariantEntity } from "../domain/variant-product.entity";
import { ClientSession } from "mongoose";

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationField[];
}
@injectable()
export class ProductVariantUniquenessValidator {
 constructor(
    @inject(TYPES.ProductReadRepository)
    private productReadRepository: IProductRepositoryRead
  ) {}

   /**
   * Main validation method - validates both internal and external uniqueness
   * @throws ValidationError if validation fails
   */
  async validate(
    product: ProductEntity,
    options?: { session?: ClientSession }
  ): Promise<void> {
    if (!product.hasVariants || !product.variants?.length) {
      return;
    }

    const errors: ValidationField[] = [];

    // 1. Validate internal uniqueness (within the product itself)
    const internalErrors = this.validateInternalUniqueness(product);
    errors.push(...internalErrors);

    // 2. Validate external uniqueness (against database)
    const externalErrors = await this.validateExternalUniqueness(product, options);
    errors.push(...externalErrors);

    if (errors.length > 0) {
      throw ValidationError.domainRules(
        "Product variant uniqueness validation failed",
        errors
      );
    }
  }
private async validateExternalUniqueness(
  product: ProductEntity,
  options?: { session?: ClientSession }
): Promise<ValidationField[]> {
  const errors: ValidationField[] = [];
  const variants = product.variants!;

  // Query for conflicts
  const conflicts = await this.productReadRepository.findConflictingProducts(
    product.id,
    variants.map(v => v.sku.value),
    variants.map(v => v.name),
    options
  );

  if (conflicts.length === 0) {
    return errors;
  }

  // ✅ Process conflicts - create error for EACH affected variant
  conflicts.forEach((conflict) => {
    // Check each variant against the conflict
    variants.forEach((variant, index) => {
      // Check if this variant's SKU conflicts with the product
      if (variant.sku.value === conflict.sku) {
        errors.push({
          field: `variants[${index}].sku`,
          message: `SKU '${conflict.sku}' already exists as product: '${conflict.name}'`,
          rule: "uniqueGlobally",
          value: variant.sku,
        });
      }

      // Check if this variant's name conflicts with the product
      if (variant.name === conflict.name) {
        errors.push({
          field: `variants[${index}].name`,
          message: `Name '${conflict.name}' already exists as product`,
          rule: "uniqueGlobally",
          value: variant.name,
        });
      }

      // Check if this variant conflicts with another product's variants
      if (conflict.variants && conflict.variants.length > 0) {
        conflict.variants.forEach((conflictVariant) => {
          if (variant.sku.value === conflictVariant.sku) {
            errors.push({
              field: `variants[${index}].sku`,
              message: `SKU '${conflictVariant.sku}' already exists as variant in product '${conflict.name}'`,
              rule: "uniqueGlobally",
              value: variant.sku,
            });
          }

          if (variant.name === conflictVariant.name) {
            errors.push({
              field: `variants[${index}].name`,
              message: `Name '${conflictVariant.name}' already exists as variant in product '${conflict.name}'`,
              rule: "uniqueGlobally",
              value: variant.name,
            });
          }
        });
      }
    });
  });

  // Remove duplicate errors (same field + same message)
  const uniqueErrors = Array.from(
    new Map(
      errors.map((e) => [`${e.field}-${e.message}`, e])
    ).values()
  );

  return uniqueErrors;
}

  private validateInternalUniqueness(product: ProductEntity): ValidationField[] {
  const errors: ValidationField[] = [];
  const variants = product.variants!;

  // Track occurrences
  const skuMap = new Map<string, number[]>();
  const nameMap = new Map<string, number[]>();

  variants.forEach((variant:ProductVariantEntity, index:number) => {
    // Track SKU occurrences
    if (!skuMap.has(variant.sku.value)) {
      skuMap.set(variant.sku.value, []);
    }
    skuMap.get(variant.sku.value)!.push(index);

    // Track name occurrences
    if (!nameMap.has(variant.name)) {
      nameMap.set(variant.name, []);
    }
    nameMap.get(variant.name)!.push(index);
  });

  // ✅ Check for duplicate SKUs - create error for EACH occurrence
  skuMap.forEach((indices, sku) => {
    if (indices.length > 1) {
      // Create separate error for each duplicate position
      indices.forEach((index) => {
        errors.push({
          field: `variants[${index}].sku`,
          message: `Duplicate SKU '${sku}' (also found at position${indices.length > 2 ? "s" : ""} ${indices.filter(i => i !== index).join(", ")})`,
          rule: "unique",
          value: sku,
        });
      });
    }
  });

  // ✅ Check for duplicate names - create error for EACH occurrence
  nameMap.forEach((indices, name) => {
    if (indices.length > 1) {
      indices.forEach((index) => {
        errors.push({
          field: `variants[${index}].name`,
          message: `Duplicate name '${name}' (also found at position${indices.length > 2 ? "s" : ""} ${indices.filter(i => i !== index).join(", ")})`,
          rule: "unique",
          value: name,
        });
      });
    }
  });

  // ✅ Check variants against parent product
  variants.forEach((variant:ProductVariantEntity, index:number) => {
    if (variant.sku.value === product.sku.value) {
      errors.push({
        field: `variants[${index}].sku`,
        message: `Variant SKU cannot match parent product SKU: '${product.sku.value}'`,
        rule: "uniqueFromParent",
        value: variant.sku,
      });
    }

    if (variant.name === product.name) {
      errors.push({
        field: `variants[${index}].name`,
        message: `Variant name cannot match parent product name: '${product.name}'`,
        rule: "uniqueFromParent",
        value: variant.name,
      });
    }
  });

  return errors;
}
}