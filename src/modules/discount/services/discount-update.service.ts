import { ClientSession } from "mongoose";
import { inject } from "inversify";
import { TYPES } from "@/shared/types";
import { ICache } from "@/core/application/ports/cache/IRedisCache";
import { DISCOUNT_CACHE_KEYS } from "@/constants/cache.constants";
import { DiscountEntity } from "../domain/discount.entity";
import { IDiscountReadRepository } from "../repositories/types/discount-read.repository.types";
import { IDiscountUpdateRepository } from "../repositories/types/discount-update.repository.types";
import { IDiscountUpdateService } from "./types/discount-update.service.types";
import { ApiError } from "@/shared/errors/api-error/ApiError";

export class UpdateDiscountService implements IDiscountUpdateService {
  constructor(
    @inject(TYPES.DiscountReadRepository)
    private discountReadRepo: IDiscountReadRepository,
    @inject(TYPES.DiscountUpdateRepository)
    private discountRepo: IDiscountUpdateRepository,
    @inject(TYPES.RedisCache)
    private cache: ICache
  ) {}

  async activate(id: string): Promise<DiscountEntity> {
    const entity = await this.discountReadRepo.findById(id);
    if (!entity) throw ApiError.notFound("Discount not found");
    entity.activate();
    return this.save(entity);
  }

  async deactivate(id: string): Promise<DiscountEntity> {
    const entity = await this.discountReadRepo.findById(id);
    if (!entity) throw ApiError.notFound("Discount not found");
    entity.deactivate();
    return this.save(entity);
  }

  async atomicIncrementUsage(id: string): Promise<boolean> {
    const { success, limitReached } = await this.discountRepo.atomicIncrementUsage(id);
    if (limitReached) {
      await this.cache.del(DISCOUNT_CACHE_KEYS.ACTIVE_AUTOMATIC);
    }
    return success;
  }

  async save(
    entity: DiscountEntity,
    options?: { session?: ClientSession }
  ): Promise<DiscountEntity> {
    const result = await this.discountRepo.save(entity, options);
    await this.cache.del(DISCOUNT_CACHE_KEYS.ACTIVE_AUTOMATIC);
    return result;
  }
}
