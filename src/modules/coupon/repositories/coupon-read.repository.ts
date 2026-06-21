import { toObjectId } from "@/shared/utils";
import { CouponEntity } from "../domain/coupon.entity";
import { CouponPersistenceToEntity } from "../domain/mappers/db-to-entity.coupon.mapper";
import CouponModel from "../models/coupon.model";
import { ICouponReadRepository } from "./types/coupon-read.repository.types";

export class CouponReadRepository implements ICouponReadRepository {
  async findAll(): Promise<CouponEntity[]> {
    const docs = await CouponModel.find({}).lean();
    return docs.map((doc) => CouponPersistenceToEntity.fromPersistenceToEntity(doc as any));
  }

  async findByCode(code: string): Promise<CouponEntity | null> {
    const doc = await CouponModel.findOne({ code: code.toUpperCase() }).lean();
    if (!doc) return null;
    return CouponPersistenceToEntity.fromPersistenceToEntity(doc as any);
  }

  async findById(id: string): Promise<CouponEntity | null> {
    const doc = await CouponModel.findById(toObjectId(id)).lean();
    if (!doc) return null;
    return CouponPersistenceToEntity.fromPersistenceToEntity(doc as any);
  }
}
