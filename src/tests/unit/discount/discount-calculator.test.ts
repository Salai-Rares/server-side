import { DiscountCalculator } from "@/modules/discount/engine/discount-calculator";
import { buildDiscount, buildCartItem, buildCart } from "../../factories/discount.factory";

describe("DiscountCalculator", () => {
  describe("percentage", () => {
    it("applies percentage to matched items", () => {
      const discount = buildDiscount({ type: "percentage", value: 20 });
      const item = buildCartItem({ originalPrice: 100, effectivePrice: 100 });
      const cart = buildCart([item]);

      const result = DiscountCalculator.calculate(discount, [item], cart);

      expect(result.itemResults).toHaveLength(1);
      expect(result.itemResults[0].finalPrice).toBe(80);
      expect(result.itemResults[0].savings).toBe(20);
      expect(result.cartDiscountAmount).toBe(0);
      expect(result.shippingFree).toBe(false);
    });

    it("applies to all cart items when no matched items (cart-level)", () => {
      const discount = buildDiscount({ type: "percentage", value: 10 });
      const items = [
        buildCartItem({ productId: "p1", originalPrice: 100, effectivePrice: 100 }),
        buildCartItem({ productId: "p2", originalPrice: 50, effectivePrice: 50 }),
      ];
      const cart = buildCart(items);

      const result = DiscountCalculator.calculate(discount, [], cart);

      expect(result.itemResults).toHaveLength(2);
      expect(result.itemResults[0].finalPrice).toBe(90);
      expect(result.itemResults[1].finalPrice).toBe(45);
    });

    it("uses min(effectivePrice, promotionPrice) — compareAtPrice wins", () => {
      const discount = buildDiscount({ type: "percentage", value: 10 });
      const item = buildCartItem({ originalPrice: 100, effectivePrice: 60 });
      const cart = buildCart([item]);

      const result = DiscountCalculator.calculate(discount, [item], cart);

      // promotionPrice = 100 * 0.9 = 90, effectivePrice = 60 → min = 60
      expect(result.itemResults[0].finalPrice).toBe(60);
      expect(result.itemResults[0].savings).toBe(40);
    });

    it("uses min(effectivePrice, promotionPrice) — promotion wins", () => {
      const discount = buildDiscount({ type: "percentage", value: 50 });
      const item = buildCartItem({ originalPrice: 100, effectivePrice: 80 });
      const cart = buildCart([item]);

      const result = DiscountCalculator.calculate(discount, [item], cart);

      // promotionPrice = 100 * 0.5 = 50, effectivePrice = 80 → min = 50
      expect(result.itemResults[0].finalPrice).toBe(50);
      expect(result.itemResults[0].savings).toBe(50);
    });
  });

  describe("fixed_amount", () => {
    it("applies as cart-level discount when no matched items", () => {
      const discount = buildDiscount({ type: "fixed_amount", value: 20 });
      const cart = buildCart([buildCartItem({ effectivePrice: 100 })]);

      const result = DiscountCalculator.calculate(discount, [], cart);

      expect(result.itemResults).toHaveLength(0);
      expect(result.cartDiscountAmount).toBe(20);
    });

    it("caps cart discount at cartTotal", () => {
      const discount = buildDiscount({ type: "fixed_amount", value: 200 });
      const cart = buildCart([buildCartItem({ effectivePrice: 80 })]);

      const result = DiscountCalculator.calculate(discount, [], cart);

      expect(result.cartDiscountAmount).toBe(80);
    });

    it("distributes proportionally across matched items", () => {
      const discount = buildDiscount({
        type: "fixed_amount",
        value: 30,
        conditions: [{ type: "category", operator: "equals", value: "cat-1" }],
      });
      const items = [
        buildCartItem({ productId: "p1", effectivePrice: 60, quantity: 1 }),
        buildCartItem({ productId: "p2", effectivePrice: 40, quantity: 1 }),
      ];
      const cart = buildCart(items);

      const result = DiscountCalculator.calculate(discount, items, cart);

      expect(result.itemResults).toHaveLength(2);
      // p1 weight: 60/100 = 0.6 → discount = 18 → finalPrice = 42
      expect(result.itemResults[0].finalPrice).toBe(42);
      // p2 weight: 40/100 = 0.4 → discount = 12 → finalPrice = 28
      expect(result.itemResults[1].finalPrice).toBe(28);
      expect(result.cartDiscountAmount).toBe(0);
    });

    it("does not go below zero per item", () => {
      const discount = buildDiscount({ type: "fixed_amount", value: 500 });
      const item = buildCartItem({ effectivePrice: 10, quantity: 1 });
      const cart = buildCart([item]);

      const result = DiscountCalculator.calculate(discount, [item], cart);

      expect(result.itemResults[0].finalPrice).toBe(0);
    });
  });

  describe("buy_x_get_y", () => {
    it("applies B2G1 free — cheapest item free", () => {
      const discount = buildDiscount({
        type: "buy_x_get_y",
        value: { buyQuantity: 2, getQuantity: 1, getDiscount: 100 },
      });
      const items = [
        buildCartItem({ productId: "p1", effectivePrice: 100, quantity: 1, categoryIds: ["cat-1"] }),
        buildCartItem({ productId: "p2", effectivePrice: 80, quantity: 1, categoryIds: ["cat-1"] }),
        buildCartItem({ productId: "p3", effectivePrice: 50, quantity: 1, categoryIds: ["cat-1"] }),
      ];
      const cart = buildCart(items);

      const result = DiscountCalculator.calculate(discount, items, cart);

      // 3 items / (2+1) = 1 set → 1 discounted → cheapest (p3 at €50) is free
      expect(result.itemResults).toHaveLength(1);
      expect(result.itemResults[0].productId).toBe("p3");
      expect(result.itemResults[0].finalPrice).toBe(0);
    });

    it("returns no discount when not enough items", () => {
      const discount = buildDiscount({
        type: "buy_x_get_y",
        value: { buyQuantity: 3, getQuantity: 1, getDiscount: 100 },
      });
      const items = [
        buildCartItem({ productId: "p1", quantity: 2, categoryIds: ["cat-1"] }),
      ];
      const cart = buildCart(items);

      const result = DiscountCalculator.calculate(discount, items, cart);

      // 2 items, need 3+1=4 for a set → 0 discounted
      expect(result.itemResults).toHaveLength(0);
    });

    it("handles multiple sets", () => {
      const discount = buildDiscount({
        type: "buy_x_get_y",
        value: { buyQuantity: 2, getQuantity: 1, getDiscount: 100 },
      });
      const items = [
        buildCartItem({ productId: "p1", effectivePrice: 30, quantity: 6, categoryIds: ["cat-1"] }),
      ];
      const cart = buildCart(items);

      const result = DiscountCalculator.calculate(discount, items, cart);

      // 6 / (2+1) = 2 sets → 2 discounted units out of 6
      expect(result.itemResults).toHaveLength(1);
      // blended: (4 * 30 + 2 * 0) / 6 = 20
      expect(result.itemResults[0].finalPrice).toBe(20);
    });

    it("applies partial discount (getDiscount < 100)", () => {
      const discount = buildDiscount({
        type: "buy_x_get_y",
        value: { buyQuantity: 2, getQuantity: 1, getDiscount: 50 },
      });
      const items = [
        buildCartItem({ productId: "p1", effectivePrice: 60, quantity: 3, categoryIds: ["cat-1"] }),
      ];
      const cart = buildCart(items);

      const result = DiscountCalculator.calculate(discount, items, cart);

      // 3 / (2+1) = 1 set → 1 unit at 50% off
      // blended: (2 * 60 + 1 * 30) / 3 = 50
      expect(result.itemResults).toHaveLength(1);
      expect(result.itemResults[0].finalPrice).toBe(50);
    });

    it("discounts cheapest items across different products", () => {
      const discount = buildDiscount({
        type: "buy_x_get_y",
        value: { buyQuantity: 2, getQuantity: 1, getDiscount: 100 },
      });
      const items = [
        buildCartItem({ productId: "expensive", effectivePrice: 100, quantity: 2, categoryIds: ["cat-1"] }),
        buildCartItem({ productId: "cheap", effectivePrice: 20, quantity: 1, categoryIds: ["cat-1"] }),
      ];
      const cart = buildCart(items);

      const result = DiscountCalculator.calculate(discount, items, cart);

      // cheapest unit is "cheap" at €20 → that one is free
      expect(result.itemResults).toHaveLength(1);
      expect(result.itemResults[0].productId).toBe("cheap");
      expect(result.itemResults[0].finalPrice).toBe(0);
    });
  });

  describe("free_shipping", () => {
    it("sets shippingFree with no item changes", () => {
      const discount = buildDiscount({
        type: "free_shipping",
        conditions: [{ type: "cart_total", operator: "greater_than", value: 1 }],
      });
      const cart = buildCart([buildCartItem()]);

      const result = DiscountCalculator.calculate(discount, [], cart);

      expect(result.shippingFree).toBe(true);
      expect(result.itemResults).toHaveLength(0);
      expect(result.cartDiscountAmount).toBe(0);
    });
  });
});
