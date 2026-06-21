import { DiscountEntity } from "../domain/discount.entity";
import { BuyXGetYValue } from "../domain/discount-domain.types";
import { CartContext, CartItemContext, ItemPriceResult } from "./types/engine.types";

export interface CalculationResult {
  itemResults: ItemPriceResult[];
  cartDiscountAmount: number;
  shippingFree: boolean;
}

export class DiscountCalculator {
  static calculate(
    discount: DiscountEntity,
    matchedItems: CartItemContext[],
    cart: CartContext
  ): CalculationResult {
    switch (discount.type) {
      case "percentage":
        return DiscountCalculator.applyPercentage(
          discount.value as number,
          matchedItems,
          cart
        );
      case "fixed_amount":
        return DiscountCalculator.applyFixedAmount(
          discount.value as number,
          matchedItems,
          cart
        );
      case "buy_x_get_y":
        return DiscountCalculator.applyBuyXGetY(
          discount.value as BuyXGetYValue,
          matchedItems
        );
      case "free_shipping":
        return { itemResults: [], cartDiscountAmount: 0, shippingFree: true };
    }
  }

  private static applyPercentage(
    pct: number,
    matchedItems: CartItemContext[],
    cart: CartContext
  ): CalculationResult {
    // empty matchedItems = no item conditions = cart-level percentage
    const items = matchedItems.length > 0 ? matchedItems : cart.items;
    const itemResults = items.map((item) => {
      const promotionPrice = item.originalPrice * (1 - pct / 100);
      const finalPrice = Math.min(item.effectivePrice, promotionPrice);
      return {
        productId: item.productId,
        variantId: item.variantId,
        finalPrice,
        originalPrice: item.originalPrice,
        savings: item.originalPrice - finalPrice,
      };
    });
    return { itemResults, cartDiscountAmount: 0, shippingFree: false };
  }

  private static applyFixedAmount(
    amount: number,
    matchedItems: CartItemContext[],
    cart: CartContext
  ): CalculationResult {
    // empty matchedItems = cart-level: reduce cart total, no per-item price changes
    if (matchedItems.length === 0) {
      return {
        itemResults: [],
        cartDiscountAmount: Math.min(amount, cart.cartTotal),
        shippingFree: false,
      };
    }

    // Item-level: distribute proportionally by (effectivePrice × quantity)
    const totalValue = matchedItems.reduce(
      (sum, item) => sum + item.effectivePrice * item.quantity,
      0
    );
    const itemResults = matchedItems.map((item) => {
      const share = (item.effectivePrice * item.quantity) / totalValue;
      const discountPerUnit = (amount * share) / item.quantity;
      const finalPrice = Math.max(0, item.effectivePrice - discountPerUnit);
      return {
        productId: item.productId,
        variantId: item.variantId,
        finalPrice,
        originalPrice: item.originalPrice,
        savings: item.originalPrice - finalPrice,
      };
    });
    return { itemResults, cartDiscountAmount: 0, shippingFree: false };
  }

  private static applyBuyXGetY(
    { buyQuantity, getQuantity, getDiscount }: BuyXGetYValue,
    matchedItems: CartItemContext[]
  ): CalculationResult {
    const totalQty = matchedItems.reduce((sum, item) => sum + item.quantity, 0);

    // How many "get" units are discounted across all complete sets
    const discountedCount =
      Math.floor(totalQty / (buyQuantity + getQuantity)) * getQuantity;

    if (discountedCount === 0) {
      return { itemResults: [], cartDiscountAmount: 0, shippingFree: false };
    }

    // Expand to individual units sorted cheapest first — max benefit to customer
    const units: { idx: number; price: number }[] = [];
    matchedItems.forEach((item, idx) => {
      for (let q = 0; q < item.quantity; q++) {
        units.push({ idx, price: item.effectivePrice });
      }
    });
    units.sort((a, b) => a.price - b.price);

    const discountCounts = new Map<number, number>();
    for (let u = 0; u < discountedCount; u++) {
      const { idx } = units[u];
      discountCounts.set(idx, (discountCounts.get(idx) ?? 0) + 1);
    }

    // Only emit results for items that actually received a discount
    const itemResults: ItemPriceResult[] = [];
    matchedItems.forEach((item, idx) => {
      const dc = discountCounts.get(idx) ?? 0;
      if (dc === 0) return;

      const discountedUnitPrice = item.effectivePrice * (1 - getDiscount / 100);
      const totalCost =
        (item.quantity - dc) * item.effectivePrice + dc * discountedUnitPrice;
      const finalPrice = totalCost / item.quantity;

      itemResults.push({
        productId: item.productId,
        variantId: item.variantId,
        finalPrice,
        originalPrice: item.originalPrice,
        savings: item.originalPrice - finalPrice,
      });
    });

    return { itemResults, cartDiscountAmount: 0, shippingFree: false };
  }
}
