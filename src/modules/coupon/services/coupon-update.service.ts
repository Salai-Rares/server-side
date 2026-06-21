import { inject } from "inversify";
import { TYPES } from "@/shared/types";
import { CouponEntity } from "../domain/coupon.entity";
import { ICouponReadRepository } from "../repositories/types/coupon-read.repository.types";
import { ICouponUpdateRepository } from "../repositories/types/coupon-update.repository.types";
import { ICouponUpdateService } from "./types/coupon-update.service.types";
import { ApiError } from "@/shared/errors/api-error/ApiError";

export class CouponUpdateService implements ICouponUpdateService {
  constructor(
    @inject(TYPES.CouponReadRepository)
    private readRepo: ICouponReadRepository,
    @inject(TYPES.CouponUpdateRepository)
    private updateRepo: ICouponUpdateRepository
  ) {}

  async activate(id: string): Promise<CouponEntity> {
    const entity = await this.readRepo.findById(id);
    if (!entity) throw ApiError.notFound("Coupon not found");
    entity.activate();
    return this.updateRepo.save(entity);
  }

  async deactivate(id: string): Promise<CouponEntity> {
    const entity = await this.readRepo.findById(id);
    if (!entity) throw ApiError.notFound("Coupon not found");
    entity.deactivate();
    return this.updateRepo.save(entity);
  }
}
