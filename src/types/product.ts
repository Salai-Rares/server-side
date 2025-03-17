
export type QueryFilter = Record<string, { $in: string[] }>;
export type KeyValueCountFilter = { key: string; value: string; count: number };
export type Filter = { key: string; value: string[] };
export type AllUniqueKeyAndValuesFilters = Filter[];
export type QueryFiltersObject = {
    sort: string;
    page: number;
    attributes: Record<string, string[]>; // Dynamic key-value pairs for attributes
  };
