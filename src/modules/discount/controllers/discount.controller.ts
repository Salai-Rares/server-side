import { Request, Response } from "express";
import { inject } from "inversify";
import { controller, httpPost, httpGet, httpPatch, BaseHttpController } from "inversify-express-utils";
import { TYPES } from "@/shared/types";
import { requireRole } from "@/middleware/http/require-role.middleware";
import { UserRole } from "@/modules/users/domain/types/user.types";
import { CallerContext } from "@/shared/types/context.types";
import { IIdGenerator } from "@/core/application/ports/id/id-generator.interface";
import { IDiscountCreateService } from "../services/types/discount-create.service.types";
import { IDiscountUpdateService } from "../services/types/discount-update.service.types";
import { IDiscountReadRepository } from "../repositories/types/discount-read.repository.types";
import { DiscountZodSchema } from "../schemas/discount.schema";
import { DiscountDtoToEntity } from "../domain/mappers/dto-to-entity.discount.mapper";
import { ApiError } from "@/shared/errors/api-error/ApiError";

@controller("/api/v1/discounts")
export class DiscountController extends BaseHttpController {
  constructor(
    @inject(TYPES.DiscountCreateService)
    private createService: IDiscountCreateService,
    @inject(TYPES.DiscountUpdateService)
    private updateService: IDiscountUpdateService,
    @inject(TYPES.DiscountReadRepository)
    private readRepo: IDiscountReadRepository,
    @inject(TYPES.IdGenerator)
    private idGenerator: IIdGenerator
  ) {
    super();
  }

  @httpPost("/", requireRole(UserRole.ADMIN, UserRole.STAFF))
  async create(req: Request, res: Response): Promise<void> {
    const dto = DiscountZodSchema.parse(req.body);
    const caller: CallerContext = {
      userId: req.session.userId!,
      role: req.session.role!,
    };
    const props = DiscountDtoToEntity.toEntity(dto, caller.userId);
    const id = this.idGenerator.generate();
    const discount = await this.createService.saveDiscount({ id, ...props });
    res.status(201).json({ status: "success", data: { discount } });
  }

  @httpGet("/", requireRole(UserRole.ADMIN, UserRole.STAFF))
  async findAll(_req: Request, res: Response): Promise<void> {
    const discounts = await this.readRepo.findAll();
    res.status(200).json({ status: "success", data: { discounts } });
  }

  @httpGet("/:id", requireRole(UserRole.ADMIN, UserRole.STAFF))
  async findById(req: Request, res: Response): Promise<void> {
    const discount = await this.readRepo.findById(req.params.id);
    if (!discount) throw ApiError.notFound("Discount not found");
    res.status(200).json({ status: "success", data: { discount } });
  }

  @httpPatch("/:id/activate", requireRole(UserRole.ADMIN, UserRole.STAFF))
  async activate(req: Request, res: Response): Promise<void> {
    const discount = await this.updateService.activate(req.params.id);
    res.status(200).json({ status: "success", data: { discount } });
  }

  @httpPatch("/:id/deactivate", requireRole(UserRole.ADMIN, UserRole.STAFF))
  async deactivate(req: Request, res: Response): Promise<void> {
    const discount = await this.updateService.deactivate(req.params.id);
    res.status(200).json({ status: "success", data: { discount } });
  }
}
