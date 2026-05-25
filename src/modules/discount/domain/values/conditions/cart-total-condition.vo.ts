
import { ValidationError } from "@/shared/errors/ValidationError";
import { DiscountConditionVO } from "./discount-condition.vo";

export class CartTotalConditionVO extends DiscountConditionVO {
  public readonly value: number;

  constructor(operator: "greater_than" | "less_than", value: number) {
    super("cart_total", operator);

    if (typeof value !== "number" || Number.isNaN(value)) {
      throw ValidationError.domainRule("conditions.value", "invalid_type", "Cart total must be a number");
    }

    this.value = value;
  }

  validate(): void {}
}
