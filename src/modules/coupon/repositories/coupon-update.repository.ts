import { ClientSession } from "mongoose";
import { toObjectId } from "@/shared/utils";
import { CouponEntity } from "../domain/coupon.entity";
import { CouponEntityToPersistenceMapper } from "../domain/mappers/entity-to-db.coupon.mapper";
import { CouponPersistenceToEntity } from "../domain/mappers/db-to-entity.coupon.mapper";
import CouponModel from "../models/coupon.model";
import { ICouponUpdateRepository } from "./types/coupon-update.repository.types";
import { ApiError } from "@/shared/errors/api-error/ApiError";

export class CouponUpdateRepository implements ICouponUpdateRepository {
  async atomicIncrementUsage(id: string, usageLimit?: number): Promise<boolean> {
    const filter: Record<string, unknown> = { _id: toObjectId(id) };
    if (usageLimit !== undefined) {
      filter["$or"] = [
        { usageLimit: null },
        { usageCount: { $lt: usageLimit } },
      ];
    }
    const result = await CouponModel.updateOne(filter, { $inc: { usageCount: 1 } });
    return result.matchedCount > 0;
  }

  async save(
    entity: CouponEntity,
    options?: { session?: ClientSession }
  ): Promise<CouponEntity> {
    const updateData = entity.toUpdateObject();
    const doc = await CouponModel.findByIdAndUpdate(
      toObjectId(entity.id),
      { $set: updateData },
      { new: true, session: options?.session }
    ).lean();
    if (!doc) throw ApiError.notFound("Coupon not found");
    return CouponPersistenceToEntity.fromPersistenceToEntity(doc as any);
  }
}
