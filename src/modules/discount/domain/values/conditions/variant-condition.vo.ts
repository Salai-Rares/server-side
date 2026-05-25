
import { ValidationError } from "@/shared/errors/ValidationError";
import { DiscountConditionVO } from "./discount-condition.vo";

export class VariantConditionVO extends DiscountConditionVO {
  public readonly value: string | string[];

  constructor(operator: "equals" | "in", value: string | string[]) {
    super("variant", operator);

    if (operator === "equals" && typeof value !== "string") {
      throw ValidationError.domainRule("conditions.value", "invalid_type", "Variant equals must be string");
    }
    if (operator === "in" && !Array.isArray(value)) {
      throw ValidationError.domainRule("conditions.value", "invalid_type", "Variant in must be array of strings");
    }

    this.value = value;
  }

  validate(): void {
    // validation already done in constructor
  }
}
