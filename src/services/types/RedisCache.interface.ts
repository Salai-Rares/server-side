import { Filter , AllUniqueKeyAndValuesFilters} from "../../types/product";
export interface IRedisCache<T> {
  set(key: string, value: T, ttl: number): Promise<void>;
  get(key: string): Promise<T | null>;
  hset(key: string, field: string, value: T): Promise<void>;
  hget(key: string, field: string): Promise<T | null>;
  hgetall(key: string): Promise<Record<string, T>>;
  exists(key:string) : Promise<boolean>
}

export interface IFilterCache extends IRedisCache<string[]> {
  setMultipleFiltersHash(key: string, filters: AllUniqueKeyAndValuesFilters): Promise<void>;
  getAllFiltersHash(key:string):Promise<AllUniqueKeyAndValuesFilters >
  getSelectedFiltersHash(key:string,listOfFields:string[]):Promise<AllUniqueKeyAndValuesFilters>
  
}
