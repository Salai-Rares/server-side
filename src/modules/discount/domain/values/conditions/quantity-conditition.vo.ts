import { ValidationError } from "@/shared/errors/ValidationError";
import { DiscountConditionVO } from "./discount-condition.vo";

export class QuantityConditionVO extends DiscountConditionVO {
  public readonly value: number;

  constructor(operator: "equals" | "greater_than" | "less_than", value: number) {
    super("quantity", operator);
    this.value = value;
    this.validate();
  }

  validate(): void {
    if (typeof this.value !== "number" || Number.isNaN(this.value)) {
      throw ValidationError.domainRule("conditions.value", "invalid_type", "Quantity must be a number");
    }
    if (this.value <= 0) {
      throw ValidationError.domainRule("conditions.value", "value_positive", "Quantity must be greater than 0");
    }
    if (!Number.isInteger(this.value)) {
      throw ValidationError.domainRule("conditions.value", "non_integer_quantity", "Quantity must be a whole number");
    }
    if (this.operator === "less_than" && this.value <= 1) {
      throw ValidationError.domainRule("conditions.value", "unreachable_quantity", "quantity less_than 1 can never match — minimum cart quantity is 1");
    }
  }
}
