import { KeyValueCountFilter, QueryFilter, QueryFiltersObject } from '../../types/product';

/**
 * Defines a service for retrieving filter-related data.
 *
 * @interface IFilterService
 */
export interface IFilterService {
  /**
   * Retrieves an array of key-value pairs (with counts) for the next filters
   * based on the current query/filter conditions.
   *
   * @param filters - An object representing the currently applied filters.
   *                  Each key should have an "$in" array indicating which
   *                  filter options are selected.
   *
   * @returns A promise that resolves to an array of key-value-count objects,
   *          where each object indicates a possible filter option and how
   *          many items match it.
   *
   * @example
   * // Sample QueryFilter shape:
   * // {
   * //   brand: { $in: ['BrandA', 'BrandB'] },
   * //   color: { $in: ['red', 'blue'] }
   * // }
   *
   * // Returns KeyValueCountFilter[] like:
   * // [
   * //   { key: 'size', value: 'Small', count: 10 },
   * //   { key: 'size', value: 'Medium', count: 5 }
   * // ]
   */
  getNextFiltersProduct(filters: QueryFiltersObject): Promise<KeyValueCountFilter[]>;
}