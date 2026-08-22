import { LeanDocument, Types } from "mongoose";
import { BuyXGetYValue } from "../domain/discount-domain.types";
import { ConditionScope } from "../constants/discount-conditions";
import { QuantityOperator } from "../domain/values/conditions/quantity-conditition.vo";
import { SubtotalOperator } from "../domain/values/conditions/subtotal-condition.vo";

export type { BuyXGetYValue };

export type DiscountConditionType =
  | { type: "product";      operator: "equals"; value: string }
  | { type: "variant";      operator: "equals"; value: string }
  | { type: "category";     operator: "equals"; value: string }
  | { type: "tag";          operator: "equals"; value: string }
  | { type: "subtotal";     operator: SubtotalOperator; value: number; scope?: ConditionScope }
  | { type: "quantity";     operator: QuantityOperator; value: number; scope?: ConditionScope }
  | { type: "user_segment"; operator: "equals"; value: string };

export interface IDiscountBase {
  name: string;
  description?: string;
  type: "percentage" | "fixed_amount" | "buy_x_get_y" | "free_shipping";
  value: number | BuyXGetYValue;
  startDate: Date;
  endDate: Date;
  usageLimit?: number;
  usageCount: number;
  active: boolean;
  stackable: boolean;
  excludeOnSale: boolean;
  priority: number;
  applicationMode: "automatic" | "code_required";
  conditions: DiscountConditionType[];
  createdBy: Types.ObjectId;
  createdAt: Date;
}

export interface IDiscount extends IDiscountBase {
  _id: Types.ObjectId;
}

export interface IDiscountDocument extends Document, IDiscountBase {
  _id: Types.ObjectId;
}

export type IDiscountLean = LeanDocument<IDiscount>;
