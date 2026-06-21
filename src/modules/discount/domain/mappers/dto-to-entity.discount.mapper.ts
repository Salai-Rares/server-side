import { DiscountZodType } from "../../schemas/discount.schema";
import { DiscountProps } from "../discount-domain.types";
import { DiscountConditionFactory } from "../values/conditions/discount-condition.factory";

export class DiscountDtoToEntity {
  public static toEntity(dto: DiscountZodType, createdBy: string): Omit<DiscountProps, "id"> {
    const conditions = dto.conditions.map((c) =>
      DiscountConditionFactory.create(c)
    );

    return {
      name: dto.name,
      description: dto.description,
      type: dto.type,
      value: dto.value,
      startDate: dto.startDate,
      endDate: dto.endDate,
      usageLimit: dto.usageLimit,
      usageCount: 0,
      active: dto.active,
      stackable: dto.stackable,
      excludeOnSale: dto.excludeOnSale,
      createdBy,
      priority: dto.priority,
      applicationMode: dto.applicationMode,
      conditions,
      createdAt: undefined,
      updatedAt: undefined,
    };
  }
}
