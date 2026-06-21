import { CouponZodType } from "../../schemas/coupon.schema";
import { CouponProps } from "../coupon-domain.types";

export class CouponDtoToEntity {
  static toEntity(dto: CouponZodType, createdBy: string): Omit<CouponProps, "id"> {
    return {
      code: dto.code,
      discountId: dto.discountId,
      createdBy,
      usageLimit: dto.usageLimit,
      usageCount: 0,
      active: dto.active,
      expiresAt: dto.expiresAt,
    };
  }
}
