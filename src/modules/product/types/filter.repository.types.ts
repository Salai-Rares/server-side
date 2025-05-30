import {
  AllUniqueKeyAndValuesFilters,
  KeyValueCountFilter,
  QueryFilter,
  QueryFiltersObject
} from "@/modules/product/types/product-query-filter.types";

/**
 * Defines a repository that provides filter-related data for products.
 *
 * @interface IFilterRepository
 */
export interface IFilterRepository {
  /**
   * Retrieves all unique key-value pairs used for filtering products.
   *
   * For example, this method could return an object where each key
   * corresponds to a filter category (e.g., "brand", "color") and
   * the value is an array of all possible options for that category.
   *
   * @returns A promise that resolves to an object containing unique
   *          filter keys and arrays of their possible values.
   *
   * @example
   * // Sample structure of AllUniqueKeyAndValuesFilters:
   * {
   *   brand: ["BrandA", "BrandB"],
   *   color: ["Red", "Blue"],
   *   size: ["Small", "Medium", "Large"]
   * }
   */
  getUniqueFilters(): Promise<AllUniqueKeyAndValuesFilters>;

  /**
   * Finds additional or "next-level" filters based on an existing set
   * of applied filters.
   *
   * This method takes an object where each key corresponds to a filter
   * category, and the value is an "$in" array indicating which items
   * are currently selected. It returns a list of further filter
   * options (with counts) that can be applied to narrow down results.
   *
   * @param filters - An object representing the current query filters.
   *                  Each key should map to an object with "$in" set
   *                  to an array of selected strings. 
   *                  For example:
   *                  {
   *                    brand: { $in: ["BrandA"] },
   *                    color: { $in: ["Red", "Blue"] }
   *                  }
   *
   * @returns A promise that resolves to an array of key-value filters
   *          with a count of how many items match that filter.
   *
   * @example
   * // Possible structure of KeyValueCountFilter:
   * [
   *   { key: "size", value: "Small", count: 12 },
   *   { key: "size", value: "Medium", count: 7 },
   *   { key: "size", value: "Large", count: 3 }
   * ]
   */
  findNextFiltersProduct(filters: QueryFiltersObject): Promise<KeyValueCountFilter[]>;
}


export interface IFilterCacheRepository extends IFilterRepository {

  getValidFilters(list :string[]):Promise<AllUniqueKeyAndValuesFilters >
}

