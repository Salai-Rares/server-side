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
    if (this._amount < 0) throw new Error("Price cannot be negative");
    if (!["LEU", "EUR"].includes(this._currency)) {
      throw new Error(`Invalid currency: ${this._currency}`);
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
