import { ValidationError } from "@/shared/errors/ValidationError";
import { ConditionScope, CONDITION_SCOPES, DEFAULT_CONDITION_SCOPE } from "@/modules/discount/constants/discount-conditions";
import { AggregateConditionVO } from "./aggregate-condition.vo";

export type SubtotalOperator =
  | "at_least"
  | "at_most"
  | "greater_than"
  | "less_than";

export class SubtotalConditionVO extends AggregateConditionVO {
  public readonly value: number;

  constructor(
    operator: SubtotalOperator,
    value: number,
    scope: ConditionScope = DEFAULT_CONDITION_SCOPE
  ) {
    super("subtotal", operator, scope);
    this.value = value;
    this.validate();
  }

  validate(): void {
    if (typeof this.value !== "number" || Number.isNaN(this.value)) {
      throw ValidationError.domainRule("conditions.value", "invalid_type", "Subtotal must be a number");
    }
    if (this.value <= 0) {
      throw ValidationError.domainRule("conditions.value", "value_positive", "Subtotal must be greater than 0");
    }
    if (!CONDITION_SCOPES.includes(this.scope)) {
      throw ValidationError.domainRule("conditions.scope", "invalid_scope", `Subtotal scope must be one of: ${CONDITION_SCOPES.join(", ")}`);
    }
  }
}
