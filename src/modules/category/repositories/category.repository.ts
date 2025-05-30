import { Document } from "mongoose";
import Category from "../models/category.model";
import {CATEGORY_PROJECTIONS} from "../constants"
import {
 
  ICategoryRepository,
  ProjectedCategory,
  ProjectionCategoryKey,
  ProjectionCategoryMap,
} from "../types/category.repository.types";
import { injectable } from "inversify";
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../schemas/category.dto";
import { RepositoryOptions } from "@/shared/types/repository.types";
import { DEFAULT_PAGINATION } from "../../../constants";
@injectable()
export class CategoryRepository implements ICategoryRepository {
  findAllCategories<K extends ProjectionCategoryKey>(
    options: RepositoryOptions<ProjectionCategoryMap[K]>
  ): Promise<ProjectedCategory<K>[]> {
    const projectionKey = options?.projection ?? CATEGORY_PROJECTIONS.SUMMARY;
    const query = Category.find({});

    // Apply projection
    if (options?.projection) {
      query.select(projectionKey);
      console.log("options exist");
     
    }

    // Apply populate
    if (options?.populate) {
      query.populate(options.populate);
    }

    // Apply sort
    if (options?.sort) {
      query.sort(options.sort);
    }

    // Apply pagination
    const page = options?.pagination?.page ?? DEFAULT_PAGINATION.DEFAULT_PAGE;
    const perPage =
      options?.pagination?.perPage ?? DEFAULT_PAGINATION.DEFAULT_PER_PAGE;

    query.skip((page - 1) * perPage).limit(perPage);

    return query.lean().exec() as unknown as Promise<ProjectedCategory<K>[]>;
  }
}
