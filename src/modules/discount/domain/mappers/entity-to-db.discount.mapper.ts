import { toObjectId } from "@/shared/utils";
import { DiscountConditionType, IDiscount } from "../../types/discount.types";
import { DiscountEntity } from "../discount.entity";

import { DiscountConditionVO } from "../values/conditions/discount-condition.vo";

export class DiscountEntityToPersistenceMapper {
  public static toPersistance(
    entity: DiscountEntity
  ): Omit<IDiscount, "createdAt" | "updatedAt"> {
    return {
      _id: toObjectId(entity.id),
      name: entity.name,
      description: entity.description,
      type: entity.type,
      value: entity.value,
      startDate: entity.startDate,
      endDate: entity.endDate,
      usageLimit: entity.usageLimit,
      usageCount: entity.usageCount,
      active: entity.active,
      priority:entity.priority,
      conditions: entity.conditions.map((c) => DiscountEntityToPersistenceMapper.conditionToPersistence(c)),
    };
  }

 private static conditionToPersistence(condition: DiscountConditionVO): DiscountConditionType {
  return {
    type: condition.type as DiscountConditionType["type"],
    operator: condition.operator as any, // narrowed at VO level
    value: condition.value as any,
  };
}
}
