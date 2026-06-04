import { ValidationError } from "@/shared/errors/ValidationError";
import { DiscountConditionVO } from "./discount-condition.vo";

export class QuantityConditionVO extends DiscountConditionVO {
  public readonly value: number;

  constructor(operator: "equals" | "greater_than" | "less_than", value: number) {
    super("quantity", operator);

    if (typeof value !== "number" || Number.isNaN(value)) {
      throw ValidationError.domainRule("conditions.value", "invalid_type", "Quantity must be a number");
    }
    if (value <= 0) {
      throw ValidationError.domainRule("conditions.value", "value_positive", "Quantity must be greater than 0");
    }

    this.value = value;
  }

  validate(): void {}
}
