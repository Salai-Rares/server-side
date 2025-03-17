import { buildQueryObject } from "../helpers/utils";
import { NextFunction, Request, Response } from "express";
import { IFilterService } from "../services/types/filterService.types";
import { RequestScopedStorage } from "../services/storage/RequestScopedStorage";
import {
  BaseHttpController,
  controller,
  httpGet,
} from "inversify-express-utils";
import { inject } from "inversify";
import { TYPES } from "../types";
import { isTruthy } from "../helpers";
import { QueryFiltersObject } from "../types/product";

@controller("/api/v1/products")
export class ProductController extends BaseHttpController {
  constructor(
    @inject(TYPES.FilterService) private filterService: IFilterService,
    @inject(TYPES.RequestScopedStorage) private storage: RequestScopedStorage
  ) {
    super();
  }

  @httpGet("/queryies", TYPES.ValidateAndSanitizeQueryFilters)
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

    // Skip building the query object if no filters exist
    // const queryObject =
    //   Object.keys(selectedFilters).length > 0
    //     ? buildQueryObject(selectedFilters)
    //     : {};

    // Fetch the next filters from the service
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
