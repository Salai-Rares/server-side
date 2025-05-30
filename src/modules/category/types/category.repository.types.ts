
import { CATEGORY_PROJECTIONS } from "../constants";


import { RepositoryOptions, StrictQuery } from "@/shared/types";
import { ICategory } from "./category.types";
import { Types } from "mongoose";




export type ProjectionCategoryKey = keyof typeof CATEGORY_PROJECTIONS;
export type ProjectionCategoryMap = typeof CATEGORY_PROJECTIONS;
export type ProjectedCategory<K extends ProjectionCategoryKey> = 
  Pick<ICategory, Extract<keyof ProjectionCategoryMap[K], keyof ICategory>> & 
  { _id: Types.ObjectId };
export interface ICategoryRepository {
  findAllCategories<K extends ProjectionCategoryKey>(
    options: RepositoryOptions<ProjectionCategoryMap[K]>
  ): Promise<ProjectedCategory<K>[]>;
}

export interface ICategoryCacheRepository extends ICategoryRepository {}
