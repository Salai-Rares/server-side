import { ValidationError } from "@/shared/errors/ValidationError";
import { ConditionScope, CONDITION_SCOPES, DEFAULT_CONDITION_SCOPE } from "@/modules/discount/constants/discount-conditions";
import { AggregateConditionVO } from "./aggregate-condition.vo";

export type QuantityOperator =
  | "equals"
  | "at_least"
  | "at_most"
  | "greater_than"
  | "less_than";

export class QuantityConditionVO extends AggregateConditionVO {
  public readonly value: number;

  constructor(
    operator: QuantityOperator,
    value: number,
    scope: ConditionScope = DEFAULT_CONDITION_SCOPE
  ) {
    super("quantity", operator, scope);
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
    if (!CONDITION_SCOPES.includes(this.scope)) {
      throw ValidationError.domainRule("conditions.scope", "invalid_scope", `Quantity scope must be one of: ${CONDITION_SCOPES.join(", ")}`);
    }
    if (this.operator === "less_than" && this.value <= 1) {
      throw ValidationError.domainRule("conditions.value", "unreachable_quantity", "quantity less_than 1 can never match — minimum cart quantity is 1");
    }
    if (this.operator === "at_most" && this.value < 1) {
      throw ValidationError.domainRule("conditions.value", "unreachable_quantity", "quantity at_most 0 can never match — minimum cart quantity is 1");
    }
  }
}
