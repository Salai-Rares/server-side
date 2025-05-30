import { inject, injectable } from "inversify";
import { IFilterRepository } from "../types/filter.repository.types";
import { QueryFilter, KeyValueCountFilter, QueryFiltersObject } from "../types/product-query-filter.types";
import { IFilterService } from "../types/filter.service.types";
import { TYPES } from "@/shared/types";
@injectable()
class FilterService implements IFilterService{
    constructor(@inject(TYPES.FilterRepository) private filterRepository:IFilterRepository ){

    }
    async getNextFiltersProduct(filters: QueryFiltersObject): Promise<KeyValueCountFilter[]> {
        if (!filters) {
            throw new Error("NextFiltersProduct error");
          }
          const result = await this.filterRepository.findNextFiltersProduct(filters); 
          return result;
    }
    
}

export default FilterService;
 