import { CouponProps } from "../../domain/coupon-domain.types";
import { CouponEntity } from "../../domain/coupon.entity";

export interface ICouponCreateService {
  save(props: CouponProps): Promise<CouponEntity>;
}
