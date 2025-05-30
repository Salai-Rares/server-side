import { buildQueryObject } from "../../../helpers/utils";
import { NextFunction, Request, Response } from "express";
import { IFilterService } from "../types/filter.service.types";
import { RequestScopedStorage } from "../../../core/request-context/request-scoped.storage";
import {
  BaseHttpController,
  controller,
  httpGet,
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
import { CreateProductDto } from "../schemas";
import { ProductCreateUseCase } from "../services/product-create.service";
import { withRetry } from "@/shared/utils/retry";
import { MongoServerError } from "mongodb";
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
    private productCreateUseCase: ProductCreateUseCase
  ) {
    super();
  }

  //cleanupUploadedFiles
  @httpPost("/product/create", productsImageUpload.raw())
  async createProduct(req: Request, res: Response): Promise<void> {
    //console.log(req.body)
    const dto = CreateProductDto.parse(mapCreateProductRequest(req));
    // console.dir(dto, { depth: null, colors: true });
    const { product, inventories } =
      await this.productCreateUseCase.createProductWithInventories(dto);
    console.log("Product in controller", product);
    console.log("inventories in controller", inventories);
    res.status(200).json({ status: "success", data: req.body });
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
