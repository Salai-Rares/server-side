import { RedisCache } from "./RedisCache";
import { Redis as RedisType } from "ioredis";
import { AllUniqueKeyAndValuesFilters, Filter } from "../../types/product";
import { IFilterCache } from "../types/RedisCache.interface";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { isTruthy } from "../../helpers";
@injectable()
export class FilterCache extends RedisCache<string[]> implements IFilterCache {
  constructor(@inject(TYPES.RedisThirdParty) redis: RedisType) {
    super("filter", redis);
  }
  async setMultipleFiltersHash(
    key: string,
    filters: AllUniqueKeyAndValuesFilters
  ): Promise<void> {
    console.log("multiple");
    const pipeline = this.client.pipeline();
    for (const filter of filters) {
      pipeline.hset(key, filter.key, JSON.stringify(filter.value));
      console.log(JSON.stringify(filter.value));
    }
    pipeline.expire(key,60*10);
    await pipeline.exec();
  }

  async getAllFiltersHash(key: string): Promise<AllUniqueKeyAndValuesFilters> {
    const cached = await this.hgetall(key);
    if (cached) {
      return Object.entries(cached).map(([field, val]) => ({
        key: field,
        value: val, // Parse the JSON string into a string[]
      }));
    }
    return [];
  }

  async getSelectedFiltersHash(
    key: string,
    listOfKeys: string[]
  ): Promise<AllUniqueKeyAndValuesFilters> {
    const cached = await this.hmgetWithKeys(key, listOfKeys);
    if (isTruthy(cached)) {
      const filtered = Object.entries(cached).filter(
        (entry): entry is [string, string[]] => {
          const [, value] = entry; // Destructure inside the function body
          return value != null && Array.isArray(value);
        }
      );
      return filtered.map(([field, value]) => ({
        key: field,
        value: value,
      }));
    }
    return [];
  }
}
