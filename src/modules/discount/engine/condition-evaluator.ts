import { DiscountEntity } from "../domain/discount.entity";
import { CartContext, CartItemContext, ConditionEvaluationResult } from "./types/engine.types";

export class ConditionEvaluator {
  private static readonly ITEM_CONDITION_TYPES = new Set([
    "product", "variant", "category", "tag",
  ]);

  static evaluate(discount: DiscountEntity, cart: CartContext): ConditionEvaluationResult {
    const conditions = discount.conditions;

    const itemConditions = conditions.filter((c) =>
      ConditionEvaluator.ITEM_CONDITION_TYPES.has(c.type)
    );
    const cartConditions = conditions.filter((c) =>
      !ConditionEvaluator.ITEM_CONDITION_TYPES.has(c.type)
    );

    // All cart-level conditions must pass (AND logic)
    for (const condition of cartConditions) {
      const passes = ConditionEvaluator.evaluateCartCondition(
        condition.type,
        condition.operator,
        condition.value as number | string,
        cart
      );
      if (!passes) return { matches: false, matchedItems: [] };
    }

    // No item conditions → discount applies to the whole cart
    if (itemConditions.length === 0) {
      return { matches: true, matchedItems: [] };
    }

    // Each item condition narrows the matched set (AND logic)
    let matchedItems: CartItemContext[] = cart.items;
    for (const condition of itemConditions) {
      matchedItems = matchedItems.filter((item) =>
        ConditionEvaluator.evaluateItemCondition(condition.type, condition.value as string, item)
      );
    }

    if (matchedItems.length === 0) {
      return { matches: false, matchedItems: [] };
    }

    return { matches: true, matchedItems };
  }

  private static evaluateCartCondition(
    type: string,
    operator: string,
    value: number | string,
    cart: CartContext
  ): boolean {
    if (type === "cart_total") {
      const total = cart.cartTotal;
      if (operator === "greater_than") return total > (value as number);
      if (operator === "less_than") return total < (value as number);
    }
    if (type === "quantity") {
      const qty = cart.totalQuantity;
      if (operator === "equals") return qty === (value as number);
      if (operator === "greater_than") return qty > (value as number);
      if (operator === "less_than") return qty < (value as number);
    }
    if (type === "user_segment") {
      return cart.userSegment === (value as string);
    }
    return false;
  }

  private static evaluateItemCondition(
    type: string,
    value: string,
    item: CartItemContext
  ): boolean {
    if (type === "product") return item.productId === value;
    if (type === "variant") return item.variantId === value;
    if (type === "category") return item.categoryIds.includes(value);
    if (type === "tag") return item.tags.includes(value);
    return false;
  }
}
