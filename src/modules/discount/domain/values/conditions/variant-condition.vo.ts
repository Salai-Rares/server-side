import { ValidationError } from "@/shared/errors/ValidationError";
import { DiscountConditionVO } from "./discount-condition.vo";

export class VariantConditionVO extends DiscountConditionVO {
  public readonly value: string;

  constructor(operator: "equals", value: string) {
    super("variant", operator);
    this.value = value;
    this.validate();
  }

  validate(): void {
    if (typeof this.value !== "string") {
      throw ValidationError.domainRule("conditions.value", "invalid_type", "Variant value must be a string");
    }
  }
}
