import { ClientSession } from "mongoose";
import { DiscountProps } from "../../domain/discount-domain.types";
import { DiscountEntity } from "../../domain/discount.entity";

export interface IDiscountCreateService {
  saveDiscount(
    props: DiscountProps,
    options?: { session: ClientSession }
  ): Promise<DiscountEntity>;
    saveBulkDiscounts(
    props: DiscountProps[],
    options?: { session: ClientSession }
  ): Promise<DiscountEntity[]>;
}
