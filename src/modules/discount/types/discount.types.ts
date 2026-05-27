import { LeanDocument, Types } from "mongoose";
import { BuyXGetYValue } from "../domain/discount-domain.types";

export type { BuyXGetYValue };

export type DiscountConditionType =
  | { type: "product"; operator: "equals" | "in"; value: string | string[] }
  | { type: "variant"; operator: "equals" | "in"; value: string | string[] }
  | { type: "category"; operator: "equals" | "in"; value: string | string[] }
  | { type: "tag"; operator: "equals" | "in"; value: string | string[] }
  | { type: "cart_total"; operator: "greater_than" | "less_than"; value: number }
  | { type: "quantity"; operator: "equals" | "greater_than" | "less_than"; value: number }
  | { type: "user_segment"; operator: "equals" | "in"; value: string | string[] };

export interface IDiscountBase {
  name: string;
  description?: string;
  type: "percentage" | "fixed_amount" | "buy_x_get_y";
  value: number | BuyXGetYValue;
  startDate:Date;
  endDate:Date;
  usageLimit?:number;
  usageCount:number;
  active:boolean;
  priority:number;
  conditions:DiscountConditionType[]
}

export interface IDiscount extends IDiscountBase {
    _id:Types.ObjectId;
}

export interface IDiscountDocument extends Document, IDiscountBase {
    _id: Types.ObjectId;
}
export type IDiscountLean = LeanDocument<IDiscount>;