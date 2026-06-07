import { ValidationError } from "@/shared/errors/ValidationError";
import { DiscountConditionVO } from "./discount-condition.vo";

export class CategoryConditionVO extends DiscountConditionVO {
  public readonly value: string;

  constructor(operator: "equals", value: string) {
    super("category", operator);
    this.value = value;
    this.validate();
  }

  validate(): void {
    if (typeof this.value !== "string") {
      throw ValidationError.domainRule("conditions.value", "invalid_type", "Category value must be a string");
    }
  }
}
