import { DiscountType } from "../../types";

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
    if (this._value <= 0) throw new Error("Discount value must be positive");
    if (this._type === "percentage" && this._value > 100) {
      throw new Error("Percentage discount cannot exceed 100%");
    }
    if (this._validUntil && this._validUntil < new Date()) {
      throw new Error("Discount has expired");
    }
  }

  // Core functionality (keeps your current behavior)
  applyTo(amount: number): number {
    if (this.type === "fixed" && this.value >= amount) {
      throw new Error("Discount can't be bigger than the price");
    }
    if (this._minApplicableAmount && amount < this._minApplicableAmount) {
      throw new Error(
        `Minimum purchase amount (${this._minApplicableAmount}) not met`
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
