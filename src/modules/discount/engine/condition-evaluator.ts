import { DiscountEntity } from "../domain/discount.entity";
import { DiscountConditionVO } from "../domain/values/conditions/discount-condition.vo";
import { AggregateConditionVO } from "../domain/values/conditions/aggregate-condition.vo";
import { ITEM_CONDITION_TYPES } from "../constants/discount-conditions";
import { CartAggregates, computeAggregates } from "./cart-aggregates";
import { CartContext, CartItemContext, ConditionEvaluationResult } from "./types/engine.types";

export class ConditionEvaluator {
  static evaluate(discount: DiscountEntity, cart: CartContext): ConditionEvaluationResult {
    const conditions = discount.conditions;

    const itemConditions = conditions.filter((c) => ITEM_CONDITION_TYPES.has(c.type));
    const cartConditions = conditions.filter((c) => !ITEM_CONDITION_TYPES.has(c.type));

    // Item filtering runs before the aggregate checks so a condition scoped to
    // matched_items has a subset to sum over. Each item condition narrows the
    // matched set (AND logic).
    let matchedItems: CartItemContext[] = cart.items;
    for (const condition of itemConditions) {
      matchedItems = matchedItems.filter((item) =>
        ConditionEvaluator.evaluateItemCondition(condition.type, condition.value as string, item)
      );
    }

    if (itemConditions.length > 0 && matchedItems.length === 0) {
      return { matches: false, matchedItems: [] };
    }

    // Summed on first demand — most discounts carry no scoped condition
    let scopedAggregates: CartAggregates | null = null;

    // All cart-level conditions must pass (AND logic)
    for (const condition of cartConditions) {
      let aggregates: CartAggregates = cart;
      if (condition instanceof AggregateConditionVO && condition.scope === "matched_items") {
        scopedAggregates ??= computeAggregates(matchedItems);
        aggregates = scopedAggregates;
      }

      if (!ConditionEvaluator.evaluateCartCondition(condition, aggregates, cart)) {
        return { matches: false, matchedItems: [] };
      }
    }

    // No item conditions → discount applies to the whole cart
    if (itemConditions.length === 0) {
      return { matches: true, matchedItems: [] };
    }

    return { matches: true, matchedItems };
  }

  private static evaluateCartCondition(
    condition: DiscountConditionVO,
    aggregates: CartAggregates,
    cart: CartContext
  ): boolean {
    if (condition.type === "subtotal") {
      return ConditionEvaluator.compare(
        aggregates.subtotal,
        condition.operator,
        condition.value as number
      );
    }
    if (condition.type === "quantity") {
      return ConditionEvaluator.compare(
        aggregates.totalQuantity,
        condition.operator,
        condition.value as number
      );
    }
    if (condition.type === "user_segment") {
      return cart.userSegment === (condition.value as string);
    }
    return false;
  }

  private static compare(actual: number, operator: string, expected: number): boolean {
    switch (operator) {
      case "equals":       return actual === expected;
      case "at_least":     return actual >= expected;
      case "at_most":      return actual <= expected;
      case "greater_than": return actual > expected;
      case "less_than":    return actual < expected;
      default:             return false;
    }
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
