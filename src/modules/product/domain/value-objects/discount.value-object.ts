import { ApiError } from "@/shared/errors/api-error/ApiError";
import { DiscountType } from "../../types";
import { th } from "@faker-js/faker/.";
import { ValidationError, ValidationField } from "@/shared/errors/ValidationError";

export class DiscountVO {
  private readonly _type: "percentage" | "fixed";
  private readonly _value: number;
  private readonly _validUntil?: Date;
  private _minApplicableAmount?: number;
  private _applicableTo?: {
    productIds?: string[];
    categories?: string[];
  };

  constructor(params: DiscountType) {
    this._type = params.type;
    this._value = params.value;
    this._validUntil = params.validUntil;
    this.validate();
  }

  private validate(): void {
    const errors: Array<ValidationField> = [];

    if (this._value <= 0) {
      errors.push({
        field: "value",
        rule: "positive",
        message: "Discount value must be positive",
        value: this._value,
      });
    }

    if (this._type === "percentage" && this._value > 100) {
        errors.push({
        field: 'value',
        rule: 'max_percentage',
        message: 'Percentage discount cannot exceed 100%',
        value: this._value
      });
    }
    if (this._validUntil && this._validUntil < new Date()) {
     errors.push({
        field: 'validUntil',
        rule: 'not_past',
        message: 'Discount expiration date cannot be in the past',
        value: this._validUntil
      });
    }
    if (errors.length > 0) {
      throw ValidationError.domainRules("Invalid discount configuration", errors);
    }
  }

  // Core functionality
  applyTo(amount: number): number {
    if (this.type === "fixed" && this.value >= amount) {
      ApiError.businessRuleViolation(
        "Discount exceeds price",
        "discount_exceeds_price",
        { discountValue: this.value, itemPrice: amount }
      );
    }
    if (this._minApplicableAmount && amount < this._minApplicableAmount) {
      throw ApiError.businessRuleViolation(
        `Minimum purchase amount (${this._minApplicableAmount}) not met`,
        "minimum_purchase_amount",
        {
          minimumAmountForDiscount: this._minApplicableAmount,
          itemPrice: amount,
        }
      );
    }
    return this._type === "percentage"
      ? amount * (1 - this._value / 100)
      : Math.max(amount - this._value, 0); // Prevent negative amounts
  }

  // Coupon-ready extensions
  withMinApplicableAmount(min: number): this {
    this._minApplicableAmount = min;
    return this;
  }

  targetingProducts(productIds: string[]): this {
    this._applicableTo = { ...this._applicableTo, productIds };
    return this;
  }

  targetingCategories(categories: string[]): this {
    this._applicableTo = { ...this._applicableTo, categories };
    return this;
  }

  isApplicableTo(product: { id: string; categories: string[] }): boolean {
    if (!this._applicableTo) return true;
    return (
      (!this._applicableTo.productIds ||
        this._applicableTo.productIds.includes(product.id)) &&
      (!this._applicableTo.categories ||
        product.categories.some((cat) =>
          this._applicableTo!.categories!.includes(cat)
        ))
    );
  }

  // Getters
  get type() {
    return this._type;
  }
  get value() {
    return this._value;
  }
  get validUntil() {
    return this._validUntil;
  }
}
