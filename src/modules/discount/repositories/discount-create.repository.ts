import { ClientSession } from "mongoose";
import { DiscountEntity } from "../domain/discount.entity";
import { IDiscountCreateRepository } from "./types/discount-create.repository.types";
import { DiscountEntityToPersistenceMapper } from "../domain/mappers/entity-to-db.discount.mapper";
import DiscountModel from "../models/discount.model";
import { DiscountPersistanceToEntity } from "../domain/mappers/db-to-entity.discount.mapper";

export class CreateDiscountRepository implements IDiscountCreateRepository {
  async saveDiscount(
    discountEntity: DiscountEntity,
    options?: { session?: ClientSession }
  ): Promise<DiscountEntity> {
    const discountDocument =
      DiscountEntityToPersistenceMapper.toPersistance(discountEntity);
    const [savedDiscount] = await DiscountModel.create([discountDocument], {
      session: options?.session,
    });
    const entity =
      DiscountPersistanceToEntity.fromPersistanceToEntity(savedDiscount);
    return entity;
  }

  async saveBulkDiscounts(
    discountEntities: DiscountEntity[],
    options?: { session?: ClientSession }
  ): Promise<DiscountEntity[]> {
    const discountData = discountEntities.map(
      DiscountEntityToPersistenceMapper.toPersistance
    );

    // Will fail completely if any document fails
    const savedDiscounts = await DiscountModel.insertMany(discountData, {
      ordered: true,
      // Stop on first error (default behavior)
      session: options?.session,
    });

    return savedDiscounts.map(
      DiscountPersistanceToEntity.fromPersistanceToEntity
    );
  }
}
