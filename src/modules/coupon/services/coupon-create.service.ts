import { inject } from "inversify";
import { TYPES } from "@/shared/types";
import { CouponProps } from "../domain/coupon-domain.types";
import { CouponEntity } from "../domain/coupon.entity";
import { ICouponCreateRepository } from "../repositories/types/coupon-create.repository.types";
import { IDiscountReadRepository } from "@/modules/discount/repositories/types/discount-read.repository.types";
import { ICouponCreateService } from "./types/coupon-create.service.types";
import { ApiError } from "@/shared/errors/api-error/ApiError";

export class CouponCreateService implements ICouponCreateService {
  constructor(
    @inject(TYPES.CouponCreateRepository)
    private couponRepo: ICouponCreateRepository,
    @inject(TYPES.DiscountReadRepository)
    private discountRepo: IDiscountReadRepository
  ) {}

  async save(props: CouponProps): Promise<CouponEntity> {
    const discount = await this.discountRepo.findById(props.discountId);
    if (!discount) throw ApiError.notFound("Referenced discount not found");
    const entity = new CouponEntity(props);
    return this.couponRepo.save(entity);
  }
}
