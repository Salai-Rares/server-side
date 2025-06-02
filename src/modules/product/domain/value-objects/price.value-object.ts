import { ValidationError, ValidationField } from "@/shared/errors/ValidationError";
import { DiscountType, PriceType } from "../../types";
import { DiscountVO } from "./discount.value-object";
export class PriceVO {
  private readonly _amount: number;
  private readonly _currency: string;

  constructor(params: PriceType) {
    this._amount = params.amount;
    this._currency = params.currency.toUpperCase();
    this.validate();
  }

  private validate(): void {
    const errors: Array<ValidationField> = [];

    if (this._amount < 0) {
        errors.push({
          field:"amount",
          rule:"amount_positive_value",
          message:'amount must be positive',
          value:this.amount
        })
      }
    if (!["LEU", "EUR"].includes(this._currency)) {
      errors.push({
          field:"currency",
          rule:"supported_currency",
          message:'currency is not supported',
          value:this.currency
        })
    }
    if(errors.length > 0){
      throw ValidationError.domainRules("Invalid price configurations",errors)
    }
  }

  get amount(): number {
    return this._amount;
  }

  get currency(): string {
    return this._currency;
  }

  equals(other: PriceVO): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  // Example domain method
  applyDiscount(discount: DiscountVO): PriceType {
    const newAmount = discount.applyTo(this._amount);
    return new PriceVO({
      amount: newAmount, // Prevent negative prices
      currency: this._currency,
    });
  }
}
