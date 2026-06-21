import { ClientSession } from "mongoose";
import { CouponEntity } from "../../domain/coupon.entity";

export interface ICouponUpdateRepository {
  atomicIncrementUsage(id: string, usageLimit?: number): Promise<boolean>;
  save(entity: CouponEntity, options?: { session?: ClientSession }): Promise<CouponEntity>;
}
