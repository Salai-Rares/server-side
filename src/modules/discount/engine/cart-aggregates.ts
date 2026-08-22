import { CartItemContext } from "./types/engine.types";

export interface CartAggregates {
  subtotal: number;
  totalQuantity: number;
}

/**
 * Sums the aggregate figures a condition can be evaluated against, over an
 * arbitrary set of items — the whole cart, the item-condition-matched subset,
 * or the on-sale-filtered subset used by `excludeOnSale`.
 */
export function computeAggregates(items: CartItemContext[]): CartAggregates {
  return {
    subtotal: items.reduce((sum, i) => sum + i.effectivePrice * i.quantity, 0),
    totalQuantity: items.reduce((sum, i) => sum + i.quantity, 0),
  };
}
