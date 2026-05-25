import { DiscountConditionVO } from "./values/conditions/discount-condition.vo";

// domain layer (entities)
export interface DiscountProps {
  // no extends
  id: string;
  name: string;
  description?: string;
  type: "percentage" | "fixed_amount" | "buy_x_get_y";
  value: number;
  startDate: Date;
  endDate: Date;
  usageLimit?: number;
  usageCount: number;
  active: boolean;
  priority:number;
  conditions: DiscountConditionVO[];
  createdAt?: Date;
  updatedAt?: Date;
}