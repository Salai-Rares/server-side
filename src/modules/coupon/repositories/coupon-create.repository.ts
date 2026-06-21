import { ClientSession } from "mongoose";
import { CouponEntity } from "../domain/coupon.entity";
import { CouponEntityToPersistenceMapper } from "../domain/mappers/entity-to-db.coupon.mapper";
import { CouponPersistenceToEntity } from "../domain/mappers/db-to-entity.coupon.mapper";
import CouponModel from "../models/coupon.model";
import { ICouponCreateRepository } from "./types/coupon-create.repository.types";

export class CouponCreateRepository implements ICouponCreateRepository {
  async save(
    entity: CouponEntity,
    options?: { session?: ClientSession }
  ): Promise<CouponEntity> {
    const data = CouponEntityToPersistenceMapper.toPersistence(entity);
    const [saved] = await CouponModel.create([data], { session: options?.session });
    return CouponPersistenceToEntity.fromPersistenceToEntity(saved);
  }
}
