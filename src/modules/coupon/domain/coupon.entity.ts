import { CouponProps } from "./coupon-domain.types";
import { ValidationError } from "@/shared/errors/ValidationError";
import { ChangeTracker } from "@/shared/services/change-tracker";
import { ApiError } from "@/shared/errors/api-error/ApiError";
import { DataKeys } from "@/shared/types/data-keys-entities.types";

type ReadonlyFields = "id" | "code" | "discountId" | "createdBy" | "createdAt";
type UpdateableCouponFields = Exclude<DataKeys<CouponEntity>, ReadonlyFields>;

export class CouponEntity implements CouponProps {
  private changeTracker: ChangeTracker<CouponEntity, UpdateableCouponFields> =
    new ChangeTracker();

  private readonly _id: string;
  private readonly _code: string;
  private readonly _discountId: string;
  private readonly _createdBy: string;
  private readonly _createdAt?: Date;
  private readonly _updatedAt?: Date;

  private _usageLimit?: number;
  private _usageCount: number;
  private _active: boolean;
  private _expiresAt?: Date;

  constructor(props: CouponProps) {
    this._id = props.id;
    this._code = props.code;
    this._discountId = props.discountId;
    this._createdBy = props.createdBy;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
    this._usageLimit = props.usageLimit;
    this._usageCount = props.usageCount;
    this._active = props.active;
    this._expiresAt = props.expiresAt;
    this.validate();
  }

  private validate() {
    if (!this._code || this._code.length < 3) {
      throw ValidationError.domainRule("code", "code_length", "Coupon code must be at least 3 characters", this._id);
    }
    if (this._code !== this._code.toUpperCase()) {
      throw ValidationError.domainRule("code", "code_uppercase", "Coupon code must be uppercase", this._id);
    }
    if (!this._discountId) {
      throw ValidationError.domainRule("discountId", "discount_required", "Coupon must reference a discount", this._id);
    }
    if (this._usageLimit !== undefined && this._usageLimit < 1) {
      throw ValidationError.domainRule("usageLimit", "usage_limit_min", "Usage limit must be at least 1", this._id);
    }
    if (this._usageLimit !== undefined && this._usageCount > this._usageLimit) {
      throw ValidationError.domainRule("usage", "usage_exceeded", "Usage count exceeds usage limit", this._id);
    }
  }

  public get id() { return this._id; }
  public get code() { return this._code; }
  public get discountId() { return this._discountId; }
  public get createdBy() { return this._createdBy; }
  public get createdAt() { return this._createdAt; }
  public get updatedAt() { return this._updatedAt; }
  public get usageLimit() { return this._usageLimit; }
  public get usageCount() { return this._usageCount; }
  public get active() { return this._active; }
  public get expiresAt() { return this._expiresAt; }

  public isActive(): boolean {
    if (!this._active) return false;
    if (this._expiresAt && this._expiresAt < new Date()) return false;
    if (this._usageLimit !== undefined && this._usageCount >= this._usageLimit) return false;
    return true;
  }

  public activate() {
    this._active = true;
    this.changeTracker.mark("active");
  }

  public deactivate() {
    this._active = false;
    this.changeTracker.mark("active");
  }

  public toUpdateObject() {
    if (!this.changeTracker.hasChanges()) {
      throw ApiError.badRequest("No changes to update");
    }
    return this.changeTracker.toUpdate(this);
  }
}
