import { ClientSession } from "mongoose";
import { DiscountProps } from "../domain/discount-domain.types";
import { DiscountEntity } from "../domain/discount.entity";
import { IDiscountCreateService } from "./types/discount-create.service.types";
import { CreateDiscountRepository } from "../repositories/discount-create.repository";
import { ICache } from "@/core/application/ports/cache/IRedisCache";
import { DISCOUNT_CACHE_KEYS } from "@/constants/cache.constants";
import { inject } from "inversify";
import { TYPES } from "@/shared/types";

export class CreateDiscountService implements IDiscountCreateService {
  constructor(
    @inject(TYPES.CreateDiscountRepository)
    private discountRepoWrite: CreateDiscountRepository,
    @inject(TYPES.RedisCache)
    private cache: ICache
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
    const result = await this.discountRepoWrite.saveBulkDiscounts(discounts, options);
    await this.cache.del(DISCOUNT_CACHE_KEYS.ACTIVE_AUTOMATIC);
    return result;
  }
  async saveDiscount(
    props: DiscountProps,
    options?: { session: ClientSession }
  ): Promise<DiscountEntity> {
    const discount = new DiscountEntity(props);
    const result = await this.discountRepoWrite.saveDiscount(discount, options);
    await this.cache.del(DISCOUNT_CACHE_KEYS.ACTIVE_AUTOMATIC);
    return result;
  }
}
