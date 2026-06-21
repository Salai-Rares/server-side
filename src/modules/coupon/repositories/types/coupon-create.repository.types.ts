import { ClientSession } from "mongoose";
import { CouponEntity } from "../../domain/coupon.entity";

export interface ICouponCreateRepository {
  save(entity: CouponEntity, options?: { session?: ClientSession }): Promise<CouponEntity>;
}
