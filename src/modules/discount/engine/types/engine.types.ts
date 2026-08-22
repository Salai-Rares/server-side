import { DiscountEntity } from "../../domain/discount.entity";

export interface CartItemContext {
  productId: string;
  variantId?: string;
  categoryIds: string[];
  tags: string[];
  quantity: number;
  originalPrice: number;
  effectivePrice: number; // compareAtPrice sale price if active and not expired, else originalPrice
  currency: string;
}

export interface CartContext {
  items: CartItemContext[];
  subtotal: number;       // sum of effectivePrice * quantity — used for subtotal conditions
  totalQuantity: number;  // total units across all items — used for quantity conditions
  userId: string;
  userSegment?: string;
}

export interface ItemPriceResult {
  productId: string;
  variantId?: string;
  finalPrice: number;
  originalPrice: number;
  savings: number;
}

export interface AppliedDiscountSummary {
  discountId: string;
  name: string;
  type: DiscountEntity["type"];
  discountAmount: number;
  affectedItemIds: string[]; // productId (or variantId); empty for cart-level discounts
}

export interface DiscountEvaluationResult {
  items: ItemPriceResult[];
  cartDiscountAmount: number;
  totalSavings: number;
  shippingFree: boolean;
  appliedDiscounts: AppliedDiscountSummary[];
}

export interface ConditionEvaluationResult {
  matches: boolean;
  matchedItems: CartItemContext[]; // empty when discount is cart-level or conditions failed
}

export interface IDiscountEngine {
  evaluate(cart: CartContext, couponCode?: string): Promise<DiscountEvaluationResult>;
}
