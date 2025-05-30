import { FilterQuery } from "mongoose";

export type RepositoryOptions<TProjections> = {
    projection?: { [K in keyof TProjections]?: 1 | 0 };
    populate?: string[] | { path: string; select?: string }[];
    sort?: { [key: string]: 1 | -1 };
    pagination?: {
        page?: number;
        perPage?: number;
      };
  };


// Strict query type with recursive $and/$or validation
export type StrictQuery<T> = FilterQuery<T> & {
    $and?: StrictQuery<T>[];
    $or?: StrictQuery<T>[];
  };
  