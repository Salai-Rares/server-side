import { LeanDocument, Types } from "mongoose";

export interface DiscountConditionType {
  type: 'product' | 'category' | 'tag' | 'cart_total' | 'quantity' | 'user_segment';
  operator: 'equals' | 'in' | 'greater_than' | 'less_than';
  value: any;
}
export interface IDiscountBase {
  name: string;
  description?: string;
  type: "percentage" | "fixed_amount" | "buy_x_get_y";
  value:number;
  startDate:Date;
  endDate:Date;
  usageLimit?:number;
  usageCount:number;
  active:boolean;
  conditions?:DiscountConditionType[]
}

export interface IDiscount extends IDiscountBase {
    _id:Types.ObjectId;
}

export interface IDiscountDocument extends Document, IDiscountBase {}
export type IDiscountLean = LeanDocument<IDiscount>;