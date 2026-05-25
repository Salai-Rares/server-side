import { DiscountConditionType } from "@/modules/discount/types/discount.types";
import { ValidationError } from "@/shared/errors/ValidationError";
import { CartTotalConditionVO } from "./cart-total-condition.vo";
import { CategoryConditionVO } from "./category-condition.vo";
import { DiscountConditionVO } from "./discount-condition.vo";
import { ProductConditionVO } from "./product-condition.vo";
import { QuantityConditionVO } from "./quantity-conditition.vo";
import { TagConditionVO } from "./tag-condition.vo";
import { UserSegmentConditionVO } from "./user-segment.condition.vo";
import { VariantConditionVO } from "./variant-condition.vo";

export class DiscountConditionFactory {
  static create(raw: DiscountConditionType): DiscountConditionVO {
    switch (raw.type) {
      case "product":
        return new ProductConditionVO(raw.operator, raw.value);
      case "category":
        return new CategoryConditionVO(raw.operator, raw.value);
      case "tag":
        return new TagConditionVO(raw.operator, raw.value);
      case "cart_total":
        return new CartTotalConditionVO(raw.operator, raw.value);
      case "quantity":
        return new QuantityConditionVO(raw.operator, raw.value);
      case "user_segment":
        return new UserSegmentConditionVO(raw.operator, raw.value);
      case "variant":
        return new VariantConditionVO(raw.operator, raw.value);
      default:
        throw ValidationError.domainRule(
          "conditions.type",
          "unsupported_type",
          `Unsupported condition type: ${(raw as any).type}`
        );
    }
  }
}
