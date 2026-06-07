import { BuyXGetYValue, DiscountProps } from "./discount-domain.types";
import { DiscountConditionType } from "../types/discount.types";
import { ValidationError } from "@/shared/errors/ValidationError";
import { ChangeTracker } from "@/shared/services/change-tracker";
import { ApiError } from "@/shared/errors/api-error/ApiError";
import { DataKeys } from "@/shared/types/data-keys-entities.types";
import {
  CONDITION_TYPE_OPERATORS,
  CONDITION_VALUE_TYPES,
  getExpectedValueType,
  getValidOperators,
  isValidTypeOperatorCombination,
} from "../constants/discount-conditions";
import { DiscountConditionVO } from "./values/conditions/discount-condition.vo";

type ReadonlyFields = "id" | "createdAt" | "updatedAt";

type UpdateableDiscountFields = Exclude<
  DataKeys<DiscountEntity>,
  ReadonlyFields
>;

export class DiscountEntity implements DiscountProps {
  private changeTracker: ChangeTracker<
    DiscountEntity,
    UpdateableDiscountFields
  > = new ChangeTracker();

  private readonly _id: string;
  private readonly _createdAt?: Date;
  private readonly _updatedAt?: Date;

  private _name: string;
  private _description?: string;
  private readonly _type: "percentage" | "fixed_amount" | "buy_x_get_y" | "free_shipping";
  private _value: number | BuyXGetYValue;
  private _startDate: Date;
  private _endDate: Date;
  private _usageLimit?: number;
  private _usageCount: number;
  private _active: boolean;
  private _conditions: DiscountConditionVO[];
  private _priority: number;
  private readonly _applicationMode: "automatic" | "code_required";

  private static readonly ITEM_CONDITION_TYPES = new Set([
    "product", "variant", "category", "tag",
  ]);

  constructor(props: DiscountProps) {
    this._id = props.id;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
    this._name = props.name;
    this._description = props.description;
    this._type = props.type;
    this._value = props.value;
    this._startDate = props.startDate;
    this._endDate = props.endDate;
    this._usageLimit = props.usageLimit;
    this._usageCount = props.usageCount;
    this._active = props.active;
    this._conditions = props.conditions ?? [];
    this._priority = props.priority;
    this._applicationMode = props.applicationMode;
    this.validate();
  }

  private validate() {
    if (!this._id) {
      throw ValidationError.domainRule("id", "id_exists", "Discount id missing", this._id);
    }

    if (!this._name || this._name.length < 5) {
      throw ValidationError.domainRule("name", "name_length", "Discount name must be at least 5 chars", this._id);
    }

    if (this._type === "buy_x_get_y") {
      const v = this._value as BuyXGetYValue;
      if (!v || typeof v !== "object") {
        throw ValidationError.domainRule("value", "invalid_buy_x_get_y", "buy_x_get_y requires an object value", this._id);
      }
      if (!Number.isInteger(v.buyQuantity) || v.buyQuantity < 1) {
        throw ValidationError.domainRule("value.buyQuantity", "invalid_quantity", "buyQuantity must be a positive integer", this._id);
      }
      if (!Number.isInteger(v.getQuantity) || v.getQuantity < 1) {
        throw ValidationError.domainRule("value.getQuantity", "invalid_quantity", "getQuantity must be a positive integer", this._id);
      }
      if (v.getDiscount < 0 || v.getDiscount > 100) {
        throw ValidationError.domainRule("value.getDiscount", "invalid_discount", "getDiscount must be between 0 and 100", this._id);
      }
    } else if (this._type === "free_shipping") {
      if (this._value !== 0) {
        throw ValidationError.domainRule("value", "free_shipping_value", "free_shipping discount must have value 0", this._id);
      }
      const hasItemCondition = this._conditions.some((c) =>
        DiscountEntity.ITEM_CONDITION_TYPES.has(c.type)
      );
      if (hasItemCondition) {
        throw ValidationError.domainRule(
          "conditions",
          "free_shipping_item_condition",
          "free_shipping applies to the whole order — use only cart_total or user_segment conditions",
          this._id
        );
      }
    } else {
      const v = this._value as number;
      if (v < 0) {
        throw ValidationError.domainRule("value", "value_positive", "Discount value must be positive", this._id);
      }
      if (this._type === "percentage" && v > 100) {
        throw ValidationError.domainRule("value", "max_percentage", "Percentage discount cannot exceed 100%", this._id);
      }
    }

    if (!this._conditions || this._conditions.length === 0) {
      throw ValidationError.domainRule("conditions", "conditions_required", "Discount must have at least one condition", this._id);
    }

    if (this._type !== "buy_x_get_y" && this._type !== "free_shipping") {
      const isSingleItemEquals =
        this._conditions.length === 1 &&
        (this._conditions[0].type === "product" || this._conditions[0].type === "variant") &&
        this._conditions[0].operator === "equals";

      if (isSingleItemEquals) {
        throw ValidationError.domainRule(
          "conditions",
          "single_item_not_allowed",
          "Use compareAtPrice on the product for single-item markdowns. The discount engine requires promotional conditions.",
          this._id
        );
      }
    }

    if (this._endDate <= this._startDate) {
      throw ValidationError.domainRule("dates", "date_order", "End date must be after start date", this._id);
    }

    if (this._usageLimit !== undefined && this._usageCount > this._usageLimit) {
      throw ValidationError.domainRule("usage", "usage_limit", "Usage count exceeds usage limit", this._id);
    }

    if (this._priority < 0 || this._priority > 3) {
      throw ValidationError.domainRule("priority", "priority_boundary", "Priority outside of boundaries", this._id);
    }
  }

  // Getters
  public get id() { return this._id; }
  public get createdAt() { return this._createdAt; }
  public get updatedAt() { return this._updatedAt; }
  public get name() { return this._name; }
  public get description() { return this._description; }
  public get type() { return this._type; }
  public get value(): number | BuyXGetYValue { return this._value; }
  public get startDate() { return this._startDate; }
  public get endDate() { return this._endDate; }
  public get usageLimit() { return this._usageLimit; }
  public get usageCount() { return this._usageCount; }
  public get active() { return this._active; }
  public get conditions() { return this._conditions; }
  public get priority() { return this._priority; }
  public get applicationMode() { return this._applicationMode; }

  public effectiveScope(): "cart" | "matched_items" {
    const hasItemCondition = this._conditions.some((c) =>
      DiscountEntity.ITEM_CONDITION_TYPES.has(c.type)
    );
    return hasItemCondition ? "matched_items" : "cart";
  }

  // Mutators
  public updateName(name: string) {
    if (name.length < 5) {
      throw ValidationError.domainRule("name", "name_length", "Discount name must be at least 5 chars", this._id);
    }
    this._name = name;
    this.changeTracker.mark("name");
  }

  public updateDescription(description?: string) {
    this._description = description;
    this.changeTracker.mark("description");
  }

  public updateValue(value: number | BuyXGetYValue) {
    const prev = this._value;
    this._value = value;
    try {
      this.validate();
    } catch (e) {
      this._value = prev;
      throw e;
    }
    this.changeTracker.mark("value");
  }

  public activate() {
    this._active = true;
    this.changeTracker.mark("active");
  }

  public deactivate() {
    this._active = false;
    this.changeTracker.mark("active");
  }

  public incrementUsage() {
    if (this._usageLimit && this._usageCount >= this._usageLimit) {
      throw ValidationError.domainRule("usage", "usage_limit", "Usage limit exceeded", this._id);
    }
    this._usageCount += 1;
    this.changeTracker.mark("usageCount");
  }

  public updateConditions(conditions: DiscountConditionVO[]) {
    if (!conditions || conditions.length === 0) {
      throw ValidationError.domainRule("conditions", "conditions_required", "Discount must have at least one condition", this._id);
    }
    this._conditions = conditions;
    this.changeTracker.mark("conditions");
  }

  public isActive(): boolean {
    const now = new Date();
    const withinDateRange = this._startDate <= now && now <= this._endDate;
    const withinUsageLimit =
      this._usageLimit === undefined || this._usageCount < this._usageLimit;
    return this._active && withinDateRange && withinUsageLimit;
  }

  public toUpdateObject() {
    if (!this.changeTracker.hasChanges()) {
      throw ApiError.badRequest("You called update method but no changes were done");
    }
    return this.changeTracker.toUpdate(this);
  }
}
