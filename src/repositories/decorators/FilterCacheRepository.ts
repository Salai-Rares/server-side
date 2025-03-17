import { inject, injectable } from "inversify";
import { IFilterCache } from "../../services/types/RedisCache.interface";
import {
  AllUniqueKeyAndValuesFilters,
  QueryFilter,
  KeyValueCountFilter,
  QueryFiltersObject,

} from "../../types/product";
import {
  IFilterCacheRepo,
  IFilterRepository,
} from "../types/filterRepository.types";
import { TYPES } from "../../types";
import { isTruthy } from "../../helpers";
@injectable()
export class FilterCacheRepository implements IFilterCacheRepo {
  private cacheKey = "Filters:uniqueCombinations";
  constructor(
    @inject(TYPES.FilterRepository) private decorated: IFilterRepository,
    @inject(TYPES.FilterCache) private cache: IFilterCache
  ) {}

  async getUniqueFilters(): Promise<AllUniqueKeyAndValuesFilters> {
    const cacheKey = this.cacheKey;
    const cached = await this.cache.getAllFiltersHash(cacheKey);
    if (isTruthy(cached)) {
      
      return cached;
    }
    const result = await this.decorated.getUniqueFilters();
    if (isTruthy(result)) {
      
      await this.cache.setMultipleFiltersHash(cacheKey, result);
      return result;
    }

    return [];
  }
  async findNextFiltersProduct(
    filters: QueryFiltersObject
  ): Promise<KeyValueCountFilter[]> {
    return this.decorated.findNextFiltersProduct(filters);
  }

  async getValidFilters(list: string[]): Promise<AllUniqueKeyAndValuesFilters> {
    const cacheKey = this.cacheKey;

    if (!list || list.length === 0) {
      return []; // Return an empty array for clarity and consistency
    }

    if ((await this.cache.exists(cacheKey)) == false) {
      
      await this.getUniqueFilters();

    }
    const cached = await this.cache.getSelectedFiltersHash(cacheKey, list);

    if (isTruthy(cached)) {
      
      return cached;
    }
    const fallBackToDB = await this.decorated.getUniqueFilters();
    console.log('fal',fallBackToDB)
    return fallBackToDB;
  }
}
