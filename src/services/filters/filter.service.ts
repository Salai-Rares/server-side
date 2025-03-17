import { inject, injectable } from "inversify";
import { IFilterRepository } from "../../repositories/types/filterRepository.types";
import { QueryFilter, KeyValueCountFilter, QueryFiltersObject } from "../../types/product";
import { IFilterService } from "../types/filterService.types";
import { TYPES } from "../../types";
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
