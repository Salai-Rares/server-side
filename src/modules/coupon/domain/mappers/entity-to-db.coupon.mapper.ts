import { toObjectId } from "@/shared/utils";
import { ICoupon } from "../../types/coupon.types";
import { CouponEntity } from "../coupon.entity";

export class CouponEntityToPersistenceMapper {
  public static toPersistence(entity: CouponEntity): Omit<ICoupon, "createdAt" | "updatedAt"> {
    return {
      _id: toObjectId(entity.id),
      code: entity.code,
      discountId: toObjectId(entity.discountId),
      createdBy: toObjectId(entity.createdBy),
      usageLimit: entity.usageLimit,
      usageCount: entity.usageCount,
      active: entity.active,
      expiresAt: entity.expiresAt,
    };
  }
}
