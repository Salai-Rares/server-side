import { ClientSession } from "mongoose";
import { DiscountProps } from "../domain/discount-domain.types";
import { DiscountEntity } from "../domain/discount.entity";
import { IDiscountCreateService } from "./types/discount-create.service.types";
import { CreateDiscountRepository } from "../repositories/discount-create.repository";
import { inject } from "inversify";
import { TYPES } from "@/shared/types";

export class CreateDiscountService implements IDiscountCreateService {
  constructor(
    @inject(TYPES.CreateDiscountRepository)
    private discountRepoWrite: CreateDiscountRepository
  ) {}
  async saveBulkDiscounts(
    props: DiscountProps[],
    options?: { session: ClientSession }
  ): Promise<DiscountEntity[]> {
    const discounts: DiscountEntity[] = props.map(
      (prop: DiscountProps): DiscountEntity => {
        return new DiscountEntity(prop);
      }
    );
    return await this.discountRepoWrite.saveBulkDiscounts(discounts, options);
  }
  async saveDiscount(
    props: DiscountProps,
    options?: { session: ClientSession }
  ): Promise<DiscountEntity> {
    const discount = new DiscountEntity(props);
    throw new Error("Method not implemented.");
  }
}
