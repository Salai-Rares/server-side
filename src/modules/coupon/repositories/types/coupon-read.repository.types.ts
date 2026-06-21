import { CouponEntity } from "../../domain/coupon.entity";

export interface ICouponReadRepository {
  findAll(): Promise<CouponEntity[]>;
  findByCode(code: string): Promise<CouponEntity | null>;
  findById(id: string): Promise<CouponEntity | null>;
}
