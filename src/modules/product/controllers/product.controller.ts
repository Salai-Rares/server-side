import { buildQueryObject } from "../../../helpers/utils";
import { NextFunction, Request, Response } from "express";
import { IFilterService } from "../types/filter.service.types";
import { RequestScopedStorage } from "../../../core/request-context/request-scoped.storage";
import {
  BaseHttpController,
  controller,
  httpGet,
  httpPatch,
  httpPost,
  withMiddleware,
} from "inversify-express-utils";
import { inject, injectable } from "inversify";
import { TYPES } from "@/shared/types";
import { isTruthy } from "../../../helpers";
import { QueryFiltersObject } from "@/modules/product/types/product-query-filter.types";
import { ICategoryService } from "../../category/types/category.service.types";
import { CreateCategoryDto } from "../../category/schemas/category.dto";
import { createMulterUpload } from "../../../middleware/multer/fileUpload.middleware";
import { cleanupUploadedFiles } from "../../../middleware/multer/cleanupUploadedFiles.middleware";
import path from "path";
import { mapCreateProductRequest } from "../mappers/http/mapCreateProductRequest";

import { ProductCreateUseCase } from "../services/product-create.service";
import { withRetry } from "@/shared/utils/retry";
import { MongoServerError } from "mongodb";
import { ProductEntity } from "../domain/product.entity";
import { CreateProductSchema, UpdateProductRequestSchema } from "../schemas";
import {
  ProcessedRequest,
  processImagesMiddleware,
} from "../middlewares/process-images.middleware";
import { ILogger } from "@/core/logger/logger.interface";
import { IProductUpdateService } from "../types/update/product-update.service.types";
import { IProductCreateService } from "../types/create/product-create.service.types";
import { ValidationError } from "@/shared/errors/ValidationError";
import { ApiError } from "@/shared/errors/api-error/ApiError";
import { ProductEntityToResponseDtoMapper } from "../mappers/domain/entity-to-response.mapper";
import { InventoryEntityToResponseDtoMapper } from "@/modules/inventory/mappers/domain/entity-to-dto.mapper";
import { ProductCreateInputAssembler } from "./assemblers/product-create-input.assembler";
import { ProductUpdateCommand } from "../services/commands/product-update.command";
import { ProductUpdateInputAssembler } from "./assemblers/product-update-input.assembler";
const productsImageUpload = createMulterUpload({
  destination: path.resolve(__dirname, "../../../images/products"),
  mimetypes: {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
  },
  fileSize: 5 * 1024 * 1024, // 5MB,
});

@controller("/api/v1/products")
export class ProductController extends BaseHttpController {
  constructor(
    @inject(TYPES.FilterService) private filterService: IFilterService,
    @inject(TYPES.RequestScopedStorage) private storage: RequestScopedStorage,
    @inject(TYPES.CategoryService) private categoryService: ICategoryService,
    @inject(TYPES.ProductCreateUseCase)
    private productCreateUseCase: IProductCreateService,
    @inject(TYPES.ProductUpdateUseCase)
    private productUpdateUseCase: IProductUpdateService,
    @inject(TYPES.Logger) private logger: ILogger
  ) {
    super();
  }

  @httpPost("/create", productsImageUpload.raw(), cleanupUploadedFiles)
  async createProduct(req: ProcessedRequest, res: Response): Promise<void> {
    const dto = ProductCreateInputAssembler.assemble(
      req.body,
      req.files as Express.Multer.File[]
    );

    const { product, inventories } =
      await this.productCreateUseCase.createProductWithInventories(dto);
    const resultProduct = ProductEntityToResponseDtoMapper.toDto(product);
    const inventoriesResult = inventories?.map(
      InventoryEntityToResponseDtoMapper.toDto
    );
    res
      .status(200)
      .json({ status: "success", data: { resultProduct, inventoriesResult } });
  }

  @httpPatch("/:id", productsImageUpload.array("images"), cleanupUploadedFiles)
  async updateMultipleProductFields(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const productId = req.params.id;
    const dto = UpdateProductRequestSchema.parse(req.body);
    const files = req.files as Express.Multer.File[];
    const uploadedMapSize = Object.keys(dto.uploadedMap || {}).length;
    const fileCount = files?.length ?? 0;

    if (uploadedMapSize !== fileCount) {
      return next(
        ApiError.businessRuleViolation(
          `Uploaded file count mismatch: expected ${uploadedMapSize}, got ${fileCount}`,
          "uploadedMap_equal_size_with_files"
        )
      );
    }
    //  const {product, inventories} = await this.productUpdateUseCase.updateProductWithInventories(productId,{dto,files})
    const assembledResult: ProductUpdateCommand =
      ProductUpdateInputAssembler.assemble(
        productId,
        dto,
        req?.files as Express.Multer.File[]
      );

      const {product,inventories} = await this.productUpdateUseCase.updateProductWithInventories(assembledResult)
    res.status(200).json({
      status: "success",
      data: { dto,assembledResult ,product},
    });
    return;
  }

  @httpGet(
    "/queryies/:category/:subcategory?",
    TYPES.ValidateParam,
    TYPES.ValidateAndSanitizeQueryFilters
  )
  async getFilters(req: Request, res: Response): Promise<void> {
    // Retrieve validated filters from the request-scoped storage
    const validatedFilters =
      this.storage.get<QueryFiltersObject>("validatedFilters");
    console.log("validated filters:", this.storage);
    // Default to an empty oject if no filters are present
    // If no filters are present, return an error response
    if (!validatedFilters) {
      res.status(400).json({
        message: "No valid filters found",
        result: [],
      });
      return;
    }
    const result = await this.filterService.getNextFiltersProduct(
      validatedFilters
    );

    // Respond with the result
    res.status(200).json({
      message: "succesfully got all the query parameters",
      result: result,
    });
    return;
  }
}
