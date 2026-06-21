import { ClientSession } from "mongoose";
import { toObjectId } from "@/shared/utils";
import { DiscountEntity } from "../domain/discount.entity";
import { DiscountPersistanceToEntity } from "../domain/mappers/db-to-entity.discount.mapper";
import DiscountModel from "../models/discount.model";
import { IDiscountUpdateRepository, IncrementUsageResult } from "./types/discount-update.repository.types";
import { ApiError } from "@/shared/errors/api-error/ApiError";

export class DiscountUpdateRepository implements IDiscountUpdateRepository {
  async atomicIncrementUsage(id: string): Promise<IncrementUsageResult> {
    const doc = await DiscountModel.findOneAndUpdate(
      {
        _id: toObjectId(id),
        $or: [
          { usageLimit: null },
          { $expr: { $lt: ["$usageCount", "$usageLimit"] } },
        ],
      },
      { $inc: { usageCount: 1 } },
      { new: true }
    ).lean();
    if (!doc) return { success: false, limitReached: false };
    const limitReached = doc.usageLimit != null && doc.usageCount >= doc.usageLimit;
    return { success: true, limitReached };
  }

  async save(
    entity: DiscountEntity,
    options?: { session?: ClientSession }
  ): Promise<DiscountEntity> {
    const updateData = entity.toUpdateObject();
    const doc = await DiscountModel.findByIdAndUpdate(
      toObjectId(entity.id),
      { $set: updateData },
      { new: true, session: options?.session }
    ).lean();
    if (!doc) throw ApiError.notFound("Discount not found");
    return DiscountPersistanceToEntity.fromPersistanceToEntity(doc as any);
  }
}
