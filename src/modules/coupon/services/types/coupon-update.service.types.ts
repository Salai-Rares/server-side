import { CouponEntity } from "../../domain/coupon.entity";

export interface ICouponUpdateService {
  activate(id: string): Promise<CouponEntity>;
  deactivate(id: string): Promise<CouponEntity>;
}
