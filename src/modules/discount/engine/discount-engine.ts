import { injectable, inject } from "inversify";
import { TYPES } from "@/shared/types";
import { ICache } from "@/core/application/ports/cache/IRedisCache";
import { DISCOUNT_CACHE_KEYS } from "@/constants/cache.constants";
import { round2 } from "@/shared/utils";
import { DiscountEntity } from "../domain/discount.entity";
import { IDiscountReadRepository } from "../repositories/types/discount-read.repository.types";
import { ICouponReadRepository } from "../../coupon/repositories/types/coupon-read.repository.types";
import { DiscountConditionFactory } from "../domain/values/conditions/discount-condition.factory";
import { ConditionEvaluator } from "./condition-evaluator";
import { DiscountCalculator } from "./discount-calculator";
import {
  CartContext,
  CartItemContext,
  DiscountEvaluationResult,
  AppliedDiscountSummary,
  ItemPriceResult,
  IDiscountEngine,
} from "./types/engine.types";

type Matched = { discount: DiscountEntity; matchedItems: CartItemContext[] };

@injectable()
export class DiscountEngine implements IDiscountEngine {
  constructor(
    @inject(TYPES.DiscountReadRepository)
    private discountRepo: IDiscountReadRepository,
    @inject(TYPES.CouponReadRepository)
    private couponRepo: ICouponReadRepository,
    @inject(TYPES.RedisCache)
    private cache: ICache
  ) {}

  async evaluate(
    cart: CartContext,
    couponCode?: string
  ): Promise<DiscountEvaluationResult> {
    const automatic = await this.fetchCachedAutomatic();

    const couponDiscount = couponCode
      ? await this.resolveCouponDiscount(couponCode)
      : null;

    const candidates = couponDiscount ? [...automatic, couponDiscount] : automatic;

    const matchingValue: Matched[] = [];
    const matchingFreeShipping: Matched[] = [];

    for (const discount of candidates) {
      const eligibleCart = discount.excludeOnSale
        ? { ...cart, items: cart.items.filter((i) => i.effectivePrice === i.originalPrice) }
        : cart;
      const { matches, matchedItems } = ConditionEvaluator.evaluate(discount, eligibleCart);
      if (!matches) continue;
      if (discount.type === "free_shipping") {
        matchingFreeShipping.push({ discount, matchedItems });
      } else {
        matchingValue.push({ discount, matchedItems });
      }
    }

    const appliedValue = this.selectValueDiscounts(matchingValue, cart);
    const shippingFree = matchingFreeShipping.length > 0;

    // key: variantId ?? productId → running final price (starts at effectivePrice)
    const finalPriceMap = new Map<string, number>();
    for (const item of cart.items) {
      finalPriceMap.set(item.variantId ?? item.productId, item.effectivePrice);
    }

    const appliedDiscounts: AppliedDiscountSummary[] = [];
    let totalCartDiscountAmount = 0;


    for (const { discount, matchedItems } of appliedValue) {
      const result = DiscountCalculator.calculate(discount, matchedItems, cart);
      totalCartDiscountAmount += result.cartDiscountAmount;

      const affectedItemIds: string[] = [];
      for (const ir of result.itemResults) {
        const key = ir.variantId ?? ir.productId;
        affectedItemIds.push(key);
        const current = finalPriceMap.get(key) ?? ir.originalPrice;
        if (ir.finalPrice < current) {
          finalPriceMap.set(key, ir.finalPrice);
        }
      }

      const discountAmount = DiscountEngine.measureSavings(
        result.itemResults,
        cart,
        result.cartDiscountAmount
      );

      appliedDiscounts.push({
        discountId: discount.id,
        name: discount.name,
        type: discount.type,
        discountAmount,
        affectedItemIds,
      });
    }

    const items: ItemPriceResult[] = cart.items.map((item) => {
      const key = item.variantId ?? item.productId;
      const finalPrice = round2(finalPriceMap.get(key) ?? item.effectivePrice);
      return {
        productId: item.productId,
        variantId: item.variantId,
        finalPrice,
        originalPrice: item.originalPrice,
        savings: round2(item.originalPrice - finalPrice),
      };
    });

    totalCartDiscountAmount = round2(totalCartDiscountAmount);

    const totalSavings = round2(
      items.reduce((sum, ir, i) => {
        return sum + ir.savings * cart.items[i].quantity;
      }, 0) + totalCartDiscountAmount
    );

    return {
      items,
      cartDiscountAmount: totalCartDiscountAmount,
      totalSavings,
      shippingFree,
      appliedDiscounts,
    };
  }

  private selectValueDiscounts(
    matching: Matched[],
    cart: CartContext
  ): Matched[] {
    if (matching.length === 0) return [];

    const stackable = matching.filter((m) => m.discount.stackable);
    const nonStackable = matching.filter((m) => !m.discount.stackable);

    if (nonStackable.length === 0) return stackable;

    // Sort non-stackable by priority DESC, break ties by calculated savings
    nonStackable.sort((a, b) => b.discount.priority - a.discount.priority);
    const topPriority = nonStackable[0].discount.priority;
    const topTier = nonStackable.filter(
      (m) => m.discount.priority === topPriority
    );

    let winner: Matched;
    if (topTier.length === 1) {
      winner = topTier[0];
    } else {
      winner = topTier.reduce((best, candidate) => {
        const bestResult = DiscountCalculator.calculate(best.discount, best.matchedItems, cart);
        const candidateResult = DiscountCalculator.calculate(candidate.discount, candidate.matchedItems, cart);
        const bestAmount = DiscountEngine.measureSavings(bestResult.itemResults, cart, bestResult.cartDiscountAmount);
        const candidateAmount = DiscountEngine.measureSavings(candidateResult.itemResults, cart, candidateResult.cartDiscountAmount);
        return candidateAmount > bestAmount ? candidate : best;
      });
    }

    return [...stackable, winner];
  }

  private async fetchCachedAutomatic(): Promise<DiscountEntity[]> {
    const raw = await this.cache.get<unknown[]>(DISCOUNT_CACHE_KEYS.ACTIVE_AUTOMATIC);
    if (raw) return raw.map(DiscountEngine.deserialize);

    const discounts = await this.discountRepo.findAllActiveAutomatic();

    const ttl =
      discounts.length === 0
        ? 60
        : Math.min(
            3600,
            Math.max(
              60,
              Math.floor(
                (Math.min(...discounts.map((d) => d.endDate.getTime())) - Date.now()) / 1000
              )
            )
          );

    await this.cache.set(
      DISCOUNT_CACHE_KEYS.ACTIVE_AUTOMATIC,
      discounts.map(DiscountEngine.serialize),
      ttl
    );
    return discounts;
  }

  private async resolveCouponDiscount(
    code: string
  ): Promise<DiscountEntity | null> {
    const coupon = await this.couponRepo.findByCode(code);
    if (!coupon || !coupon.isActive()) return null;
    const discount = await this.discountRepo.findById(coupon.discountId);
    if (!discount || !discount.isActive()) return null;
    return discount;
  }

  // Measures how much a set of item results saves relative to effectivePrice (not originalPrice)
  // so compareAtPrice savings are not attributed to the discount
  private static measureSavings(
    itemResults: ItemPriceResult[],
    cart: CartContext,
    cartDiscountAmount: number
  ): number {
    const itemSavings = itemResults.reduce((sum, ir) => {
      const key = ir.variantId ?? ir.productId;
      const cartItem = cart.items.find(
        (i) => (i.variantId ?? i.productId) === key
      );
      if (!cartItem) return sum;
      return sum + Math.max(0, cartItem.effectivePrice - ir.finalPrice) * cartItem.quantity;
    }, 0);
    return itemSavings + cartDiscountAmount;
  }

  private static serialize(entity: DiscountEntity): Record<string, unknown> {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      type: entity.type,
      applicationMode: entity.applicationMode,
      value: entity.value,
      startDate: entity.startDate.toISOString(),
      endDate: entity.endDate.toISOString(),
      usageLimit: entity.usageLimit,
      usageCount: entity.usageCount,
      active: entity.active,
      stackable: entity.stackable,
      excludeOnSale: entity.excludeOnSale,
      priority: entity.priority,
      conditions: entity.conditions.map((c) => ({
        type: c.type,
        operator: c.operator,
        value: c.value,
      })),
      createdBy: entity.createdBy,
      createdAt: entity.createdAt?.toISOString(),
      updatedAt: entity.updatedAt?.toISOString(),
    };
  }

  private static deserialize(raw: any): DiscountEntity {
    const conditions = (raw.conditions as any[]).map((c) =>
      DiscountConditionFactory.create(c)
    );
    return new DiscountEntity({
      ...raw,
      startDate: new Date(raw.startDate),
      endDate: new Date(raw.endDate),
      createdAt: raw.createdAt ? new Date(raw.createdAt) : undefined,
      updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : undefined,
      conditions,
    });
  }
}
