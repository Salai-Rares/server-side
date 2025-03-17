import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { inject, injectable } from "inversify";
import { BaseMiddleware } from "inversify-express-utils";
import { FilterCacheRepository } from "../../repositories/decorators/FilterCacheRepository";
import { RequestScopedStorage } from "../../services/storage/RequestScopedStorage";
import {
  sanitizeQueryRequest,
  splitObjectValuesByComma,
} from "../../helpers/utils";
import { TYPES } from "../../types";
import { isTruthy } from "../../helpers";
import { PREDEFINED_FILTERS } from "../../constants";
import { QueryFiltersObject } from "../../types/product";

// Define types for better type safety and readability
type ParsedQueryData = {
  sort: "asc" | "desc" | "price" | "rating" | "popularity";
  page: number;
} & Record<string, string[] | undefined>;

@injectable()
export class ValidateAndSanitizeQueryFilters extends BaseMiddleware {
  constructor(
    @inject(TYPES.FilterCacheRepository)
    private filterCacheRepository: FilterCacheRepository,
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
    // Rebind RequestScopedStorage to ensure the same instance is shared
    this.bind<RequestScopedStorage>(TYPES.RequestScopedStorage).toConstantValue(
      this.storage
    );
    // Early return if query is empty
   
    // Sanitize and split query parameters
    const sanitizedReqQueryObject = sanitizeQueryRequest(req.query);
    const splittedSanitized = splitObjectValuesByComma(sanitizedReqQueryObject);

    // Get valid filters from the cache
    const filterKeys = Object.keys(splittedSanitized);
    const validFilters = await this.filterCacheRepository.getValidFilters(
      filterKeys
    );

    // Extract valid attribute keys
    const validAttributeKeys = validFilters.map((f) => f.key);

    // Build a dynamic Zod schema for query validation
    const querySchema = this.createQuerySchema(validAttributeKeys);
    const parsedQuery = querySchema.safeParse(splittedSanitized);

    // Handle validation errors
    if (!parsedQuery.success) {
      res
        .status(400)
        .json({ success: false, errors: parsedQuery.error.errors });
      return;
    }

    // Use parsed data (no need for type assertion)
    const parsedData = parsedQuery.data as ParsedQueryData;

    // Build structured query object
    const structuredQuery: QueryFiltersObject = {
      sort: parsedData.sort,
      page: parsedData.page,
      attributes: {},
    };

    // Extract and validate dynamic filters
    const dynamicFilters = this.extractDynamicFilters(
      parsedData,
      validAttributeKeys
    );
    for (const key in dynamicFilters) {
      const filter = validFilters.find((f) => f.key === key);
      if (filter) {
        const validValues = dynamicFilters[key].filter((value) =>
          filter.value.includes(value)
        );
        if (validValues.length > 0) {
          structuredQuery.attributes[key] = validValues;
        }
      }
    }

    // Store validated filters in request-scoped storage
    this.storage.set("validatedFilters", structuredQuery);

    // Proceed to the next middleware
    return next();
  }

  // Helper function to create a dynamic Zod schema
  private createQuerySchema(validAttributeKeys: string[]) {
    return z.object({
      sort: z
        .enum(["asc", "desc", "price", "rating", "popularity"])
        .default("popularity"),
      page: z
        .string()
        .default("1")
        .transform((val) => {
          const num = Number(val);
          return !isNaN(num) && num > 0 ? num : 1;
        }),
      ...Object.fromEntries(
        validAttributeKeys.map((key) => [key, z.array(z.string()).optional()])
      ),
    });
  }

  // Helper function to extract dynamic filters
  private extractDynamicFilters(
    parsedData: ParsedQueryData,
    validAttributeKeys: string[]
  ): Record<string, string[]> {
    const dynamicFilters: Record<string, string[]> = {};
    for (const key of validAttributeKeys) {
      if (PREDEFINED_FILTERS.has(key)) continue;
      if (parsedData[key] && Array.isArray(parsedData[key])) {
        dynamicFilters[key] = parsedData[key] as string[];
      }
    }
    return dynamicFilters;
  }
}
