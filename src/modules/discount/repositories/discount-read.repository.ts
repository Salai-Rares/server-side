import { toObjectId } from "@/shared/utils";
import { DiscountPersistanceToEntity } from "../domain/mappers/db-to-entity.discount.mapper";
import DiscountModel from "../models/discount.model";
import { IDiscountReadRepository } from "./types/discount-read.repository.types";
import { DiscountEntity } from "../domain/discount.entity";

export class DiscountReadRepository implements IDiscountReadRepository {
  async findAll(): Promise<DiscountEntity[]> {
    const docs = await DiscountModel.find({}).lean();
    return docs.map((doc) =>
      DiscountPersistanceToEntity.fromPersistanceToEntity(doc as any)
    );
  }

  async findAllActiveAutomatic(): Promise<DiscountEntity[]> {
    const now = new Date();
    const docs = await DiscountModel.find({
      active: true,
      applicationMode: "automatic",
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).lean();
    return docs.map((doc) =>
      DiscountPersistanceToEntity.fromPersistanceToEntity(doc as any)
    );
  }

  async findById(id: string): Promise<DiscountEntity | null> {
    const doc = await DiscountModel.findById(toObjectId(id)).lean();
    if (!doc) return null;
    return DiscountPersistanceToEntity.fromPersistanceToEntity(doc as any);
  }
}
