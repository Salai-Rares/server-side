import { inject, injectable } from "inversify";
import { BaseMiddleware } from "inversify-express-utils";
import { TYPES } from "@/shared/types";
import { Request, Response, NextFunction } from "express";
import { RequestScopedStorage } from "../../core/request-context/request-scoped.storage";
import { CreateCategoryDto } from "../../modules/category/schemas/category.dto";

@injectable()
export class ValidateCreateCategory extends BaseMiddleware {
  constructor(
    @inject(TYPES.RequestScopedStorage)
    private storage: RequestScopedStorage
  ) {
    super();
  }
  async handler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    this.bind<RequestScopedStorage>(TYPES.RequestScopedStorage).toConstantValue(
      this.storage
    );
    try {
      const validated = CreateCategoryDto.parse(this.categoryDTO(req));
      console.log("Validated:", validated);
      return next();
    } catch (error) {
      next(error); // Forward to Express error handler
    }
  }

  private categoryDTO(req: Request) {
    const category = { ...req.body };
    // console.log('req file' , req.file)
    category.image = req.file?.filename;
    return category;
  }
}

export class ValidateCategoryParams extends BaseMiddleware {
  constructor(
    @inject(TYPES.RequestScopedStorage)
    private storage: RequestScopedStorage,
    // @inject(TYPES.CategoryCacheRepository)
    // private cacheCategory : CategoryCacheRepository
  ) {
    super();
  }

  async handler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    this.bind<RequestScopedStorage>(TYPES.RequestScopedStorage).toConstantValue(
      this.storage
    );

  }
}
