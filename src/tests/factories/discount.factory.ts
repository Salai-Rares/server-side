import { DiscountEntity } from "@/modules/discount/domain/discount.entity";
import { BuyXGetYValue } from "@/modules/discount/domain/discount-domain.types";
import { DiscountConditionFactory } from "@/modules/discount/domain/values/conditions/discount-condition.factory";
import { CouponEntity } from "@/modules/coupon/domain/coupon.entity";
import { CartContext, CartItemContext } from "@/modules/discount/engine/types/engine.types";
import { computeAggregates } from "@/modules/discount/engine/cart-aggregates";

interface RawCondition {
  type: string;
  operator: string;
  value: unknown;
  scope?: "cart" | "matched_items";
}

interface BuildDiscountInput {
  id?: string;
  name?: string;
  type?: "percentage" | "fixed_amount" | "buy_x_get_y" | "free_shipping";
  value?: number | BuyXGetYValue;
  conditions?: RawCondition[];
  stackable?: boolean;
  excludeOnSale?: boolean;
  priority?: number;
  applicationMode?: "automatic" | "code_required";
  active?: boolean;
  usageLimit?: number;
  usageCount?: number;
  startDate?: Date;
  endDate?: Date;
  createdBy?: string;
}

export function buildDiscount(input: BuildDiscountInput = {}): DiscountEntity {
  const type = input.type ?? "percentage";

  const defaultConditions: RawCondition[] =
    type === "buy_x_get_y"
      ? [{ type: "category", operator: "equals", value: "cat-1" }]
      : [{ type: "subtotal", operator: "greater_than", value: 1 }];

  const defaultValue =
    type === "buy_x_get_y"
      ? { buyQuantity: 2, getQuantity: 1, getDiscount: 100 }
      : type === "free_shipping"
        ? 0
        : 10;

  const rawConditions = input.conditions ?? defaultConditions;
  const conditions = rawConditions.map((c) =>
    DiscountConditionFactory.create(c as any)
  );

  return new DiscountEntity({
    id: input.id ?? "discount-1",
    name: input.name ?? "Test Discount",
    type,
    value: input.value ?? defaultValue,
    startDate: input.startDate ?? new Date("2020-01-01"),
    endDate: input.endDate ?? new Date("2030-01-01"),
    usageLimit: input.usageLimit,
    usageCount: input.usageCount ?? 0,
    active: input.active ?? true,
    stackable: input.stackable ?? false,
    excludeOnSale: input.excludeOnSale ?? false,
    priority: input.priority ?? 1,
    applicationMode: input.applicationMode ?? "automatic",
    createdBy: input.createdBy ?? "user-1",
    conditions,
  });
}

export function buildCartItem(
  overrides: Partial<CartItemContext> = {}
): CartItemContext {
  return {
    productId: "product-1",
    categoryIds: ["cat-1"],
    tags: ["tag-1"],
    quantity: 1,
    originalPrice: 100,
    effectivePrice: 100,
    currency: "EUR",
    ...overrides,
  };
}

export function buildCart(
  items: CartItemContext[],
  overrides: Partial<Omit<CartContext, "items">> = {}
): CartContext {
  return {
    items,
    ...computeAggregates(items),
    userId: "user-1",
    ...overrides,
  };
}

interface BuildCouponInput {
  id?: string;
  code?: string;
  discountId?: string;
  createdBy?: string;
  usageLimit?: number;
  usageCount?: number;
  active?: boolean;
  expiresAt?: Date;
}

export function buildCoupon(input: BuildCouponInput = {}): CouponEntity {
  return new CouponEntity({
    id: input.id ?? "coupon-1",
    code: input.code ?? "SAVE10",
    discountId: input.discountId ?? "discount-1",
    createdBy: input.createdBy ?? "user-1",
    usageLimit: input.usageLimit,
    usageCount: input.usageCount ?? 0,
    active: input.active ?? true,
    expiresAt: input.expiresAt,
  });
}
