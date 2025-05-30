import { Filter, AllUniqueKeyAndValuesFilters } from "@/modules/product/types/product-query-filter.types";
export interface IRedisCache {
  set<T>(key: string, value: T, ttl: number): Promise<void>;
  get<T>(key: string): Promise<T | null>;
  hset<T>(key: string, field: string, value: T): Promise<void>;
  hget<T>(key: string, field: string): Promise<T | null>;
  hgetall<T>(key: string): Promise<Record<string, T>>;
  exists(key:string) : Promise<boolean>
}

export interface IFilterCache extends IRedisCache {
  setMultipleFiltersHash(key: string, filters: AllUniqueKeyAndValuesFilters): Promise<void>;
  getAllFiltersHash(key:string):Promise<AllUniqueKeyAndValuesFilters >
  getSelectedFiltersHash(key:string,listOfFields:string[]):Promise<AllUniqueKeyAndValuesFilters>
  
}
