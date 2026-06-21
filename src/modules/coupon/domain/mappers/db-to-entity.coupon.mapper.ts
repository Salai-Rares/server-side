import { ICouponDocument } from "../../types/coupon.types";
import { CouponEntity } from "../coupon.entity";

export class CouponPersistenceToEntity {
  public static fromPersistenceToEntity(model: ICouponDocument): CouponEntity {
    return new CouponEntity({
      id: model._id.toHexString(),
      code: model.code,
      discountId: model.discountId.toHexString(),
      createdBy: model.createdBy.toHexString(),
      usageLimit: model.usageLimit,
      usageCount: model.usageCount,
      active: model.active,
      expiresAt: model.expiresAt,
      createdAt: (model as any).createdAt,
      updatedAt: (model as any).updatedAt,
    });
  }
}
