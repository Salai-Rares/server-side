import { ConditionScope, DEFAULT_CONDITION_SCOPE } from "@/modules/discount/constants/discount-conditions";
import { DiscountConditionVO } from "./discount-condition.vo";

/**
 * A condition compared against a figure summed over a set of cart items.
 *
 * `scope` names which items that sum covers: the whole cart, or only the items
 * picked out by the discount's item conditions. "3 units of product X" is scope
 * `matched_items`; "3 units anywhere in the cart" is scope `cart`.
 *
 * Scope gates the discount — it never decides which items get discounted. The
 * item conditions alone decide that.
 */
export abstract class AggregateConditionVO extends DiscountConditionVO {
  public readonly scope: ConditionScope;

  constructor(
    type: string,
    operator: string,
    scope: ConditionScope = DEFAULT_CONDITION_SCOPE
  ) {
    super(type, operator);
    this.scope = scope;
  }
}
