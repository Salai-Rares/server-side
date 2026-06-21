import { Request, Response } from "express";
import { inject } from "inversify";
import { controller, httpPost, httpGet, httpPatch, BaseHttpController } from "inversify-express-utils";
import { TYPES } from "@/shared/types";
import { requireRole } from "@/middleware/http/require-role.middleware";
import { UserRole } from "@/modules/users/domain/types/user.types";
import { CallerContext } from "@/shared/types/context.types";
import { IIdGenerator } from "@/core/application/ports/id/id-generator.interface";
import { ICouponCreateService } from "../services/types/coupon-create.service.types";
import { ICouponUpdateService } from "../services/types/coupon-update.service.types";
import { ICouponReadRepository } from "../repositories/types/coupon-read.repository.types";
import { CouponZodSchema } from "../schemas/coupon.schema";
import { CouponDtoToEntity } from "../domain/mappers/dto-to-entity.coupon.mapper";
import { ApiError } from "@/shared/errors/api-error/ApiError";

@controller("/api/v1/coupons")
export class CouponController extends BaseHttpController {
  constructor(
    @inject(TYPES.CouponCreateService)
    private createService: ICouponCreateService,
    @inject(TYPES.CouponUpdateService)
    private updateService: ICouponUpdateService,
    @inject(TYPES.CouponReadRepository)
    private readRepo: ICouponReadRepository,
    @inject(TYPES.IdGenerator)
    private idGenerator: IIdGenerator
  ) {
    super();
  }

  @httpPost("/", requireRole(UserRole.ADMIN, UserRole.STAFF))
  async create(req: Request, res: Response): Promise<void> {
    const dto = CouponZodSchema.parse(req.body);
    const caller: CallerContext = {
      userId: req.session.userId!,
      role: req.session.role!,
    };
    const props = CouponDtoToEntity.toEntity(dto, caller.userId);
    const id = this.idGenerator.generate();
    const coupon = await this.createService.save({ id, ...props });
    res.status(201).json({ status: "success", data: { coupon } });
  }

  @httpGet("/", requireRole(UserRole.ADMIN, UserRole.STAFF))
  async findAll(_req: Request, res: Response): Promise<void> {
    const coupons = await this.readRepo.findAll();
    res.status(200).json({ status: "success", data: { coupons } });
  }

  @httpGet("/:id", requireRole(UserRole.ADMIN, UserRole.STAFF))
  async findById(req: Request, res: Response): Promise<void> {
    const coupon = await this.readRepo.findById(req.params.id);
    if (!coupon) throw ApiError.notFound("Coupon not found");
    res.status(200).json({ status: "success", data: { coupon } });
  }

  @httpPatch("/:id/activate", requireRole(UserRole.ADMIN, UserRole.STAFF))
  async activate(req: Request, res: Response): Promise<void> {
    const coupon = await this.updateService.activate(req.params.id);
    res.status(200).json({ status: "success", data: { coupon } });
  }

  @httpPatch("/:id/deactivate", requireRole(UserRole.ADMIN, UserRole.STAFF))
  async deactivate(req: Request, res: Response): Promise<void> {
    const coupon = await this.updateService.deactivate(req.params.id);
    res.status(200).json({ status: "success", data: { coupon } });
  }
}
