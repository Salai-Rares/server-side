import { AllUniqueKeyAndValuesFilters } from "./product";

export interface IFilterCacheReader {
  existsFilters(filters: Record<string, unknown>): Promise<boolean>;
}

export interface IFilterCacheSaver {
    saveFiltersToRedis(filters: AllUniqueKeyAndValuesFilters):Promise<void>;
}

