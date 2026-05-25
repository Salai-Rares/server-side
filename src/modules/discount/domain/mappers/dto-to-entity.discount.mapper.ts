import { DiscountConditionType, DiscountZodType } from "../../schemas/discount.schema";
import { DiscountProps } from "../discount-domain.types";
import { DiscountEntity } from "../discount.entity";
import { DiscountConditionFactory } from "../values/conditions/discount-condition.factory";
import { DiscountConditionVO } from "../values/conditions/discount-condition.vo";

export class DiscountDtoToEntity {
  public static toEntity(dto: DiscountZodType, productName?: string, conditions?:DiscountConditionType[]): Omit<DiscountProps, "id"> {
     const rawConditions = dto.conditions ?? conditions ?? [];

    // convert to VO
    const conditionsVo: DiscountConditionVO[] = rawConditions.map((c) =>
      DiscountConditionFactory.create(c)
    );

       // Fallback name if dto.name not provided
    const generatedName =
      dto.name ?? (productName ? `${productName}-discount` : "unnamed-discount");

    return {
      name:generatedName,
      description: dto.description,
      type: dto.type,
      value: dto.value,
      startDate: dto.startDate,
      endDate: dto.endDate,
      usageLimit: dto.usageLimit,
      usageCount: dto.usageCount,
      active: dto.active,
      priority:dto.priority,
      conditions:conditionsVo,
      createdAt: undefined,
      updatedAt: undefined,
    };
  }
}
