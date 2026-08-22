import { DiscountConditionFactory } from "@/modules/discount/domain/values/conditions/discount-condition.factory";
import { buildDiscount } from "../../factories/discount.factory";

const condition = (raw: unknown) => DiscountConditionFactory.create(raw as any);

describe("DiscountEntity condition validation", () => {
  describe("matched_items scope requires an item condition", () => {
    it("rejects a scoped condition with nothing to scope to", () => {
      expect(() =>
        buildDiscount({
          conditions: [
            { type: "quantity", operator: "at_least", value: 3, scope: "matched_items" },
          ],
        })
      ).toThrow(/matched_items/);
    });

    it("accepts a scoped condition alongside an item condition", () => {
      expect(() =>
        buildDiscount({
          conditions: [
            { type: "product", operator: "equals", value: "X" },
            { type: "quantity", operator: "at_least", value: 3, scope: "matched_items" },
          ],
        })
      ).not.toThrow();
    });

    it("accepts an unscoped condition on its own", () => {
      expect(() =>
        buildDiscount({
          conditions: [{ type: "quantity", operator: "at_least", value: 3 }],
        })
      ).not.toThrow();
    });
  });

  describe("updateConditions", () => {
    it("rejects a scoped condition with no item condition", () => {
      const discount = buildDiscount({
        conditions: [{ type: "quantity", operator: "at_least", value: 3 }],
      });

      expect(() =>
        discount.updateConditions([
          condition({ type: "quantity", operator: "at_least", value: 3, scope: "matched_items" }),
        ])
      ).toThrow(/matched_items/);
    });

    it("leaves the previous conditions in place when validation fails", () => {
      const discount = buildDiscount({
        conditions: [{ type: "quantity", operator: "at_least", value: 3 }],
      });
      const before = discount.conditions;

      expect(() =>
        discount.updateConditions([
          condition({ type: "quantity", operator: "at_least", value: 3, scope: "matched_items" }),
        ])
      ).toThrow();

      expect(discount.conditions).toEqual(before);
    });

    it("accepts a valid replacement", () => {
      const discount = buildDiscount({
        conditions: [{ type: "quantity", operator: "at_least", value: 3 }],
      });

      discount.updateConditions([
        condition({ type: "product", operator: "equals", value: "X" }),
        condition({ type: "quantity", operator: "at_least", value: 3, scope: "matched_items" }),
      ]);

      expect(discount.conditions).toHaveLength(2);
    });
  });
});
