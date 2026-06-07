import { DiscountConditionVO } from "./values/conditions/discount-condition.vo";

export interface BuyXGetYValue {
  buyQuantity: number;
  getQuantity: number;
  getDiscount: number; // percentage off the "get" items — 100 means free
}

// domain layer (entities)
export interface DiscountProps {
  // no extends
  id: string;
  name: string;
  description?: string;
  type: "percentage" | "fixed_amount" | "buy_x_get_y" | "free_shipping";
  applicationMode: "automatic" | "code_required";
  value: number | BuyXGetYValue;
  startDate: Date;
  endDate: Date;
  usageLimit?: number;
  usageCount: number;
  active: boolean;
  priority: number;
  conditions: DiscountConditionVO[];
  createdAt?: Date;
  updatedAt?: Date;
}