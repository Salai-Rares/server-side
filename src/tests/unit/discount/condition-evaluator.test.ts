import { ConditionEvaluator } from "@/modules/discount/engine/condition-evaluator";
import { buildDiscount, buildCartItem, buildCart } from "../../factories/discount.factory";

describe("ConditionEvaluator", () => {
  describe("cart conditions", () => {
    it("passes when cart_total greater_than threshold", () => {
      const discount = buildDiscount({
        conditions: [{ type: "cart_total", operator: "greater_than", value: 100 }],
      });
      const cart = buildCart([buildCartItem({ effectivePrice: 200 })]);

      const result = ConditionEvaluator.evaluate(discount, cart);

      expect(result.matches).toBe(true);
      expect(result.matchedItems).toHaveLength(0);
    });

    it("fails when cart_total below threshold", () => {
      const discount = buildDiscount({
        conditions: [{ type: "cart_total", operator: "greater_than", value: 100 }],
      });
      const cart = buildCart([buildCartItem({ effectivePrice: 50 })]);

      const result = ConditionEvaluator.evaluate(discount, cart);

      expect(result.matches).toBe(false);
    });

    it("passes when cart_total less_than threshold", () => {
      const discount = buildDiscount({
        conditions: [{ type: "cart_total", operator: "less_than", value: 200 }],
      });
      const cart = buildCart([buildCartItem({ effectivePrice: 100 })]);

      const result = ConditionEvaluator.evaluate(discount, cart);

      expect(result.matches).toBe(true);
    });

    it("passes when quantity equals target", () => {
      const discount = buildDiscount({
        conditions: [{ type: "quantity", operator: "equals", value: 3 }],
      });
      const cart = buildCart([
        buildCartItem({ quantity: 2 }),
        buildCartItem({ productId: "product-2", quantity: 1 }),
      ]);

      const result = ConditionEvaluator.evaluate(discount, cart);

      expect(result.matches).toBe(true);
    });

    it("passes when quantity greater_than target", () => {
      const discount = buildDiscount({
        conditions: [{ type: "quantity", operator: "greater_than", value: 2 }],
      });
      const cart = buildCart([buildCartItem({ quantity: 5 })]);

      const result = ConditionEvaluator.evaluate(discount, cart);

      expect(result.matches).toBe(true);
    });

    it("passes when user_segment matches", () => {
      const discount = buildDiscount({
        conditions: [{ type: "user_segment", operator: "equals", value: "vip" }],
      });
      const cart = buildCart([buildCartItem()], { userSegment: "vip" });

      const result = ConditionEvaluator.evaluate(discount, cart);

      expect(result.matches).toBe(true);
    });

    it("fails when user_segment does not match", () => {
      const discount = buildDiscount({
        conditions: [{ type: "user_segment", operator: "equals", value: "vip" }],
      });
      const cart = buildCart([buildCartItem()], { userSegment: "regular" });

      const result = ConditionEvaluator.evaluate(discount, cart);

      expect(result.matches).toBe(false);
    });
  });

  describe("item conditions", () => {
    it("matches items by category", () => {
      const discount = buildDiscount({
        type: "buy_x_get_y",
        conditions: [{ type: "category", operator: "equals", value: "shoes" }],
      });
      const cart = buildCart([
        buildCartItem({ productId: "p1", categoryIds: ["shoes"] }),
        buildCartItem({ productId: "p2", categoryIds: ["hats"] }),
      ]);

      const result = ConditionEvaluator.evaluate(discount, cart);

      expect(result.matches).toBe(true);
      expect(result.matchedItems).toHaveLength(1);
      expect(result.matchedItems[0].productId).toBe("p1");
    });

    it("matches items by tag", () => {
      const discount = buildDiscount({
        type: "buy_x_get_y",
        conditions: [{ type: "tag", operator: "equals", value: "summer" }],
      });
      const cart = buildCart([
        buildCartItem({ productId: "p1", tags: ["summer", "new"] }),
        buildCartItem({ productId: "p2", tags: ["winter"] }),
      ]);

      const result = ConditionEvaluator.evaluate(discount, cart);

      expect(result.matches).toBe(true);
      expect(result.matchedItems).toHaveLength(1);
      expect(result.matchedItems[0].productId).toBe("p1");
    });

    it("matches items by variant", () => {
      const discount = buildDiscount({
        type: "buy_x_get_y",
        conditions: [{ type: "variant", operator: "equals", value: "v-red" }],
      });
      const cart = buildCart([
        buildCartItem({ productId: "p1", variantId: "v-red" }),
        buildCartItem({ productId: "p1", variantId: "v-blue" }),
      ]);

      const result = ConditionEvaluator.evaluate(discount, cart);

      expect(result.matches).toBe(true);
      expect(result.matchedItems).toHaveLength(1);
      expect(result.matchedItems[0].variantId).toBe("v-red");
    });

    it("returns no match when no items satisfy condition", () => {
      const discount = buildDiscount({
        type: "buy_x_get_y",
        conditions: [{ type: "category", operator: "equals", value: "electronics" }],
      });
      const cart = buildCart([
        buildCartItem({ categoryIds: ["shoes"] }),
      ]);

      const result = ConditionEvaluator.evaluate(discount, cart);

      expect(result.matches).toBe(false);
      expect(result.matchedItems).toHaveLength(0);
    });
  });

  describe("mixed cart + item conditions (AND)", () => {
    it("passes when both cart and item conditions are satisfied", () => {
      const discount = buildDiscount({
        type: "buy_x_get_y",
        conditions: [
          { type: "cart_total", operator: "greater_than", value: 50 },
          { type: "category", operator: "equals", value: "shoes" },
        ],
      });
      const cart = buildCart([
        buildCartItem({ productId: "p1", categoryIds: ["shoes"], effectivePrice: 80 }),
        buildCartItem({ productId: "p2", categoryIds: ["hats"], effectivePrice: 30 }),
      ]);

      const result = ConditionEvaluator.evaluate(discount, cart);

      expect(result.matches).toBe(true);
      expect(result.matchedItems).toHaveLength(1);
      expect(result.matchedItems[0].productId).toBe("p1");
    });

    it("fails when cart condition fails even if items match", () => {
      const discount = buildDiscount({
        type: "buy_x_get_y",
        conditions: [
          { type: "cart_total", operator: "greater_than", value: 500 },
          { type: "category", operator: "equals", value: "shoes" },
        ],
      });
      const cart = buildCart([
        buildCartItem({ categoryIds: ["shoes"], effectivePrice: 80 }),
      ]);

      const result = ConditionEvaluator.evaluate(discount, cart);

      expect(result.matches).toBe(false);
    });
  });

  describe("multiple item conditions of different types (AND across types)", () => {
    it("narrows matched items — item must satisfy all conditions", () => {
      const discount = buildDiscount({
        type: "buy_x_get_y",
        conditions: [
          { type: "category", operator: "equals", value: "shoes" },
          { type: "tag", operator: "equals", value: "summer" },
        ],
      });
      const cart = buildCart([
        buildCartItem({ productId: "p1", categoryIds: ["shoes"], tags: ["summer"] }),
        buildCartItem({ productId: "p2", categoryIds: ["shoes"], tags: ["winter"] }),
        buildCartItem({ productId: "p3", categoryIds: ["hats"], tags: ["summer"] }),
      ]);

      const result = ConditionEvaluator.evaluate(discount, cart);

      expect(result.matches).toBe(true);
      expect(result.matchedItems).toHaveLength(1);
      expect(result.matchedItems[0].productId).toBe("p1");
    });
  });

  describe("no item conditions → cart-level discount", () => {
    it("returns matches true with empty matchedItems", () => {
      const discount = buildDiscount({
        conditions: [{ type: "cart_total", operator: "greater_than", value: 1 }],
      });
      const cart = buildCart([buildCartItem(), buildCartItem({ productId: "p2" })]);

      const result = ConditionEvaluator.evaluate(discount, cart);

      expect(result.matches).toBe(true);
      expect(result.matchedItems).toHaveLength(0);
    });
  });
});
