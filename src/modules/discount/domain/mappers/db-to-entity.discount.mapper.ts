import { IDiscountDocument } from "../../types/discount.types";
import { DiscountEntity } from "../discount.entity";
import { DiscountConditionFactory } from "../values/conditions/discount-condition.factory";

export class DiscountPersistanceToEntity {
  public static fromPersistanceToEntity(
    model: IDiscountDocument
  ): DiscountEntity {
    const entity = new DiscountEntity({
      id: model._id.toHexString(),
      updatedAt: (model as any).updatedAt,
      priority:model.priority,
      name: model.name,
      description: model.description,
      type: model.type,
      value: model.value,
      startDate: model.startDate,
      endDate: model.endDate,
      usageLimit: model.usageLimit,
      usageCount: model.usageCount,
      active: model.active,
      stackable: model.stackable,
      excludeOnSale: model.excludeOnSale,
      applicationMode: model.applicationMode,
      createdBy: model.createdBy.toHexString(),
      createdAt: (model as any).createdAt,
      conditions: (model.conditions || []).map((c) =>
        DiscountConditionFactory.create(c)
      ),
    });
    return entity
  }

}
