import { Filter, AllUniqueKeyAndValuesFilters } from "@/modules/product/types/product-query-filter.types";
import { ICache } from "../../core/application/ports/cache/IRedisCache";
export interface IFilterCache  {
  setMultipleFiltersHash(key: string, filters: AllUniqueKeyAndValuesFilters): Promise<void>;
  getAllFiltersHash(key:string):Promise<AllUniqueKeyAndValuesFilters >
  getSelectedFiltersHash(key:string,listOfFields:string[]):Promise<AllUniqueKeyAndValuesFilters>
  
}
