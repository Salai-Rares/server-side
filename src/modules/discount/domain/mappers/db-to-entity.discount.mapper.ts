import { IDiscountDocument } from "../../types/discount.types";
import { DiscountEntity } from "../discount.entity";
import { DiscountConditionFactory } from "../values/conditions/discount-condition.factory";

export class DiscountPersistanceToEntity {
  public static fromPersistanceToEntity(
    model: IDiscountDocument
  ): DiscountEntity {
    const entity = new DiscountEntity({
      id: model._id.toHexString(),
      createdAt: (model as any).createdAt, // only present if schema has timestamps
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

      conditions: (model.conditions || []).map((c) =>
        DiscountConditionFactory.create(c)
      ),
    });
    return entity
  }

}
