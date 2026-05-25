import { inject, injectable } from "inversify";
import { IFilterCache } from "../../../../shared/types/redis-cache.types";
import {
  AllUniqueKeyAndValuesFilters,
  QueryFilter,
  KeyValueCountFilter,
  QueryFiltersObject
} from "../../types/product-query-filter.types";
import {
  IFilterCacheRepository,
  IFilterRepository,
} from "../../types/filter.repository.types";
import { TYPES } from "@/shared/types";
import { isTruthy } from "../../../../helpers";

@injectable()
export class FilterCacheRepository implements IFilterCacheRepository {
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

  /*
  Get all the pairs of key-value filters from cache that matches the list of input keys "list:string[]". 
  If notihing in cache retrieve all the valid key-values pair from db
  */
  async getValidFilters(list: string[]): Promise<AllUniqueKeyAndValuesFilters> {
    const cacheKey = this.cacheKey;

    if (!list || list.length === 0) {
      return []; // Return an empty array for clarity and consistency
    }

    // if ((await this.cache.exists(cacheKey)) == false) {
      
    //   await this.getUniqueFilters();

    // }
    const cached = await this.cache.getSelectedFiltersHash(cacheKey, list);

    if (isTruthy(cached)) {
      
      return cached;
    }
    const fallBackToDB = await this.decorated.getUniqueFilters();
    console.log('fal',fallBackToDB)
    return fallBackToDB;
  }
}
