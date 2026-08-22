import "reflect-metadata";
import { mock, MockProxy } from "jest-mock-extended";
import { DiscountEngine } from "@/modules/discount/engine/discount-engine";
import { IDiscountReadRepository } from "@/modules/discount/repositories/types/discount-read.repository.types";
import { ICouponReadRepository } from "@/modules/coupon/repositories/types/coupon-read.repository.types";
import { ICache } from "@/core/application/ports/cache/IRedisCache";
import { DISCOUNT_CACHE_KEYS } from "@/constants/cache.constants";
import { buildDiscount, buildCartItem, buildCart, buildCoupon } from "../../factories/discount.factory";

describe("DiscountEngine", () => {
  let engine: DiscountEngine;
  let discountRepo: MockProxy<IDiscountReadRepository>;
  let couponRepo: MockProxy<ICouponReadRepository>;
  let cache: MockProxy<ICache>;

  beforeEach(() => {
    discountRepo = mock<IDiscountReadRepository>();
    couponRepo = mock<ICouponReadRepository>();
    cache = mock<ICache>();
    engine = new DiscountEngine(discountRepo, couponRepo, cache);
  });

  describe("cache behavior", () => {
    it("uses cached discounts on cache hit", async () => {
      const discount = buildDiscount({
        type: "percentage",
        value: 10,
        conditions: [{ type: "subtotal", operator: "greater_than", value: 50 }],
      });
      // Simulate cache returning serialized discount
      cache.get.mockResolvedValue([
        {
          id: discount.id,
          name: discount.name,
          type: discount.type,
          value: discount.value,
          applicationMode: discount.applicationMode,
          startDate: discount.startDate.toISOString(),
          endDate: discount.endDate.toISOString(),
          usageCount: discount.usageCount,
          active: discount.active,
          stackable: discount.stackable,
          excludeOnSale: discount.excludeOnSale,
          priority: discount.priority,
          createdBy: discount.createdBy,
          conditions: [{ type: "subtotal", operator: "greater_than", value: 50 }],
        },
      ]);
      const cart = buildCart([buildCartItem({ effectivePrice: 100 })]);

      const result = await engine.evaluate(cart);

      expect(cache.get).toHaveBeenCalledWith(DISCOUNT_CACHE_KEYS.ACTIVE_AUTOMATIC);
      expect(discountRepo.findAllActiveAutomatic).not.toHaveBeenCalled();
      expect(result.items[0].finalPrice).toBe(90);
    });

    // Without scope on the serialized shape a cached discount silently reverts
    // to cart scope, which is exactly the over-grant scope exists to prevent.
    it("round-trips condition scope through the cache", async () => {
      const discount = buildDiscount({
        type: "percentage",
        value: 10,
        conditions: [
          { type: "product", operator: "equals", value: "X" },
          { type: "quantity", operator: "at_least", value: 3, scope: "matched_items" },
        ],
      });
      cache.get.mockResolvedValue(null);
      discountRepo.findAllActiveAutomatic.mockResolvedValue([discount]);
      const cart = buildCart([
        buildCartItem({ productId: "X", quantity: 1, originalPrice: 100, effectivePrice: 100 }),
        buildCartItem({ productId: "Y", quantity: 5, originalPrice: 100, effectivePrice: 100 }),
      ]);

      await engine.evaluate(cart);
      const [, serialized] = cache.set.mock.calls[0];
      expect((serialized as any[])[0].conditions).toContainEqual(
        expect.objectContaining({ type: "quantity", scope: "matched_items" })
      );

      // replay the cached payload — must still refuse to fire
      cache.get.mockResolvedValue(serialized as unknown[]);
      const result = await engine.evaluate(cart);

      expect(result.appliedDiscounts).toHaveLength(0);
    });

    it("fetches from DB and caches on cache miss", async () => {
      cache.get.mockResolvedValue(null);
      discountRepo.findAllActiveAutomatic.mockResolvedValue([]);
      const cart = buildCart([buildCartItem()]);

      await engine.evaluate(cart);

      expect(discountRepo.findAllActiveAutomatic).toHaveBeenCalled();
      expect(cache.set).toHaveBeenCalledWith(
        DISCOUNT_CACHE_KEYS.ACTIVE_AUTOMATIC,
        expect.any(Array),
        expect.any(Number)
      );
    });
  });

  describe("no matching discounts", () => {
    it("returns original prices when no discounts exist", async () => {
      cache.get.mockResolvedValue(null);
      discountRepo.findAllActiveAutomatic.mockResolvedValue([]);
      const cart = buildCart([
        buildCartItem({ productId: "p1", originalPrice: 100, effectivePrice: 100 }),
      ]);

      const result = await engine.evaluate(cart);

      expect(result.items[0].finalPrice).toBe(100);
      expect(result.items[0].savings).toBe(0);
      expect(result.totalSavings).toBe(0);
      expect(result.shippingFree).toBe(false);
      expect(result.appliedDiscounts).toHaveLength(0);
    });

    it("returns original prices when conditions fail", async () => {
      const discount = buildDiscount({
        conditions: [{ type: "subtotal", operator: "greater_than", value: 500 }],
      });
      cache.get.mockResolvedValue(null);
      discountRepo.findAllActiveAutomatic.mockResolvedValue([discount]);
      const cart = buildCart([buildCartItem({ effectivePrice: 50 })]);

      const result = await engine.evaluate(cart);

      expect(result.appliedDiscounts).toHaveLength(0);
      expect(result.items[0].finalPrice).toBe(50);
    });
  });

  describe("automatic discount application", () => {
    it("applies a matching percentage discount", async () => {
      const discount = buildDiscount({
        type: "percentage",
        value: 20,
        conditions: [{ type: "subtotal", operator: "greater_than", value: 10 }],
      });
      cache.get.mockResolvedValue(null);
      discountRepo.findAllActiveAutomatic.mockResolvedValue([discount]);
      const cart = buildCart([
        buildCartItem({ originalPrice: 100, effectivePrice: 100 }),
      ]);

      const result = await engine.evaluate(cart);

      expect(result.items[0].finalPrice).toBe(80);
      expect(result.items[0].savings).toBe(20);
      expect(result.totalSavings).toBe(20);
      expect(result.appliedDiscounts).toHaveLength(1);
      expect(result.appliedDiscounts[0].name).toBe("Test Discount");
    });

    it("applies free_shipping independently from value discounts", async () => {
      const freeShipping = buildDiscount({
        id: "fs-1",
        type: "free_shipping",
        conditions: [{ type: "subtotal", operator: "greater_than", value: 10 }],
      });
      cache.get.mockResolvedValue(null);
      discountRepo.findAllActiveAutomatic.mockResolvedValue([freeShipping]);
      const cart = buildCart([buildCartItem({ effectivePrice: 100 })]);

      const result = await engine.evaluate(cart);

      expect(result.shippingFree).toBe(true);
      expect(result.items[0].finalPrice).toBe(100);
    });
  });

  describe("coupon resolution", () => {
    it("applies coupon discount alongside automatic discounts", async () => {
      const automatic = buildDiscount({
        id: "auto-1",
        name: "Auto Discount",
        type: "percentage",
        value: 10,
        stackable: true,
        conditions: [{ type: "subtotal", operator: "greater_than", value: 10 }],
      });
      const couponDiscount = buildDiscount({
        id: "coupon-disc-1",
        name: "Coupon Deal",
        type: "percentage",
        value: 20,
        applicationMode: "code_required",
        conditions: [{ type: "subtotal", operator: "greater_than", value: 10 }],
      });
      const coupon = buildCoupon({ discountId: "coupon-disc-1" });

      cache.get.mockResolvedValue(null);
      discountRepo.findAllActiveAutomatic.mockResolvedValue([automatic]);
      couponRepo.findByCode.mockResolvedValue(coupon);
      discountRepo.findById.mockResolvedValue(couponDiscount);

      const cart = buildCart([
        buildCartItem({ originalPrice: 100, effectivePrice: 100 }),
      ]);

      const result = await engine.evaluate(cart, "SAVE10");

      expect(result.appliedDiscounts).toHaveLength(2);
      // non-stackable coupon wins (20%), stackable auto (10%) also applies
      // percentage: min(effectivePrice, originalPrice * (1 - pct/100))
      // coupon: 100 * 0.8 = 80, auto: 100 * 0.9 = 90
      // min(80, 90) = 80
      expect(result.items[0].finalPrice).toBe(80);
    });

    it("ignores invalid coupon code", async () => {
      cache.get.mockResolvedValue(null);
      discountRepo.findAllActiveAutomatic.mockResolvedValue([]);
      couponRepo.findByCode.mockResolvedValue(null);
      const cart = buildCart([buildCartItem()]);

      const result = await engine.evaluate(cart, "INVALID");

      expect(result.appliedDiscounts).toHaveLength(0);
    });

    it("ignores expired coupon", async () => {
      const coupon = buildCoupon({
        expiresAt: new Date("2020-01-01"),
      });
      cache.get.mockResolvedValue(null);
      discountRepo.findAllActiveAutomatic.mockResolvedValue([]);
      couponRepo.findByCode.mockResolvedValue(coupon);
      const cart = buildCart([buildCartItem()]);

      const result = await engine.evaluate(cart, "SAVE10");

      expect(discountRepo.findById).not.toHaveBeenCalled();
      expect(result.appliedDiscounts).toHaveLength(0);
    });

    it("ignores coupon when linked discount is inactive", async () => {
      const coupon = buildCoupon({ discountId: "inactive-disc" });
      const inactiveDiscount = buildDiscount({
        id: "inactive-disc",
        active: false,
      });

      cache.get.mockResolvedValue(null);
      discountRepo.findAllActiveAutomatic.mockResolvedValue([]);
      couponRepo.findByCode.mockResolvedValue(coupon);
      discountRepo.findById.mockResolvedValue(inactiveDiscount);

      const cart = buildCart([buildCartItem()]);
      const result = await engine.evaluate(cart, "SAVE10");

      expect(result.appliedDiscounts).toHaveLength(0);
    });
  });

  describe("stacking logic", () => {
    it("applies all stackable discounts", async () => {
      const disc1 = buildDiscount({
        id: "s1",
        name: "Stack One",
        type: "percentage",
        value: 10,
        stackable: true,
        conditions: [{ type: "subtotal", operator: "greater_than", value: 1 }],
      });
      const disc2 = buildDiscount({
        id: "s2",
        name: "Stack Two",
        type: "percentage",
        value: 20,
        stackable: true,
        conditions: [{ type: "subtotal", operator: "greater_than", value: 1 }],
      });
      cache.get.mockResolvedValue(null);
      discountRepo.findAllActiveAutomatic.mockResolvedValue([disc1, disc2]);
      const cart = buildCart([
        buildCartItem({ originalPrice: 100, effectivePrice: 100 }),
      ]);

      const result = await engine.evaluate(cart);

      expect(result.appliedDiscounts).toHaveLength(2);
      // 10% → 90, 20% → 80, min wins → 80
      expect(result.items[0].finalPrice).toBe(80);
    });

    it("picks highest priority non-stackable and keeps stackable", async () => {
      const nonStack1 = buildDiscount({
        id: "ns1",
        name: "Low Priority",
        type: "percentage",
        value: 30,
        stackable: false,
        priority: 1,
        conditions: [{ type: "subtotal", operator: "greater_than", value: 1 }],
      });
      const nonStack2 = buildDiscount({
        id: "ns2",
        name: "High Priority",
        type: "percentage",
        value: 15,
        stackable: false,
        priority: 3,
        conditions: [{ type: "subtotal", operator: "greater_than", value: 1 }],
      });
      const stackable = buildDiscount({
        id: "s1",
        name: "Stackable",
        type: "percentage",
        value: 5,
        stackable: true,
        conditions: [{ type: "subtotal", operator: "greater_than", value: 1 }],
      });
      cache.get.mockResolvedValue(null);
      discountRepo.findAllActiveAutomatic.mockResolvedValue([nonStack1, nonStack2, stackable]);
      const cart = buildCart([
        buildCartItem({ originalPrice: 100, effectivePrice: 100 }),
      ]);

      const result = await engine.evaluate(cart);

      // ns2 wins (priority 3), ns1 excluded (priority 1), stackable kept
      expect(result.appliedDiscounts).toHaveLength(2);
      const names = result.appliedDiscounts.map((d) => d.name);
      expect(names).toContain("High Priority");
      expect(names).toContain("Stackable");
      expect(names).not.toContain("Low Priority");
      // ns2: 100 * 0.85 = 85, stackable: 100 * 0.95 = 95, min → 85
      expect(result.items[0].finalPrice).toBe(85);
    });

    it("breaks priority tie by higher savings", async () => {
      const tie1 = buildDiscount({
        id: "t1",
        name: "Small Discount",
        type: "percentage",
        value: 10,
        stackable: false,
        priority: 2,
        conditions: [{ type: "subtotal", operator: "greater_than", value: 1 }],
      });
      const tie2 = buildDiscount({
        id: "t2",
        name: "Big Discount",
        type: "percentage",
        value: 40,
        stackable: false,
        priority: 2,
        conditions: [{ type: "subtotal", operator: "greater_than", value: 1 }],
      });
      cache.get.mockResolvedValue(null);
      discountRepo.findAllActiveAutomatic.mockResolvedValue([tie1, tie2]);
      const cart = buildCart([
        buildCartItem({ originalPrice: 100, effectivePrice: 100 }),
      ]);

      const result = await engine.evaluate(cart);

      expect(result.appliedDiscounts).toHaveLength(1);
      expect(result.appliedDiscounts[0].name).toBe("Big Discount");
      expect(result.items[0].finalPrice).toBe(60);
    });
  });

  describe("excludeOnSale", () => {
    it("excludes on-sale items when excludeOnSale is true", async () => {
      const discount = buildDiscount({
        type: "percentage",
        value: 10,
        excludeOnSale: true,
        conditions: [{ type: "subtotal", operator: "greater_than", value: 1 }],
      });
      cache.get.mockResolvedValue(null);
      discountRepo.findAllActiveAutomatic.mockResolvedValue([discount]);
      const cart = buildCart([
        buildCartItem({ productId: "full-price", originalPrice: 100, effectivePrice: 100 }),
        buildCartItem({ productId: "on-sale", originalPrice: 100, effectivePrice: 60 }),
      ]);

      const result = await engine.evaluate(cart);

      const fullPriceItem = result.items.find((i) => i.productId === "full-price")!;
      const onSaleItem = result.items.find((i) => i.productId === "on-sale")!;
      expect(fullPriceItem.finalPrice).toBe(90);
      expect(onSaleItem.finalPrice).toBe(60);
    });

    it("includes on-sale items when excludeOnSale is false", async () => {
      const discount = buildDiscount({
        type: "percentage",
        value: 50,
        excludeOnSale: false,
        conditions: [{ type: "subtotal", operator: "greater_than", value: 1 }],
      });
      cache.get.mockResolvedValue(null);
      discountRepo.findAllActiveAutomatic.mockResolvedValue([discount]);
      const cart = buildCart([
        buildCartItem({ productId: "on-sale", originalPrice: 100, effectivePrice: 70 }),
      ]);

      const result = await engine.evaluate(cart);

      // promotion: 100 * 0.5 = 50, effectivePrice = 70 → min = 50
      expect(result.items[0].finalPrice).toBe(50);
    });

    it("resums aggregates over the eligible items", async () => {
      const discount = buildDiscount({
        type: "percentage",
        value: 10,
        excludeOnSale: true,
        conditions: [{ type: "subtotal", operator: "at_least", value: 100 }],
      });
      cache.get.mockResolvedValue(null);
      discountRepo.findAllActiveAutomatic.mockResolvedValue([discount]);
      // 30 + 200 = 230 across the cart, but only the 30 item is eligible
      const cart = buildCart([
        buildCartItem({ productId: "full-price", originalPrice: 30, effectivePrice: 30 }),
        buildCartItem({ productId: "on-sale", originalPrice: 400, effectivePrice: 200 }),
      ]);

      const result = await engine.evaluate(cart);

      expect(result.appliedDiscounts).toHaveLength(0);
      // prices untouched — the markdown on the on-sale item is not the discount
      expect(result.items.find((i) => i.productId === "full-price")!.finalPrice).toBe(30);
      expect(result.items.find((i) => i.productId === "on-sale")!.finalPrice).toBe(200);
    });
  });

  describe("rounding", () => {
    it("rounds final prices to 2 decimal places", async () => {
      const discount = buildDiscount({
        type: "percentage",
        value: 33,
        conditions: [{ type: "subtotal", operator: "greater_than", value: 1 }],
      });
      cache.get.mockResolvedValue(null);
      discountRepo.findAllActiveAutomatic.mockResolvedValue([discount]);
      const cart = buildCart([
        buildCartItem({ originalPrice: 99.99, effectivePrice: 99.99 }),
      ]);

      const result = await engine.evaluate(cart);

      // 99.99 * 0.67 = 66.9933 → rounded to 66.99
      expect(result.items[0].finalPrice).toBe(66.99);
      expect(result.items[0].savings).toBe(33);
      expect(result.totalSavings).toBe(33);
    });
  });
});
