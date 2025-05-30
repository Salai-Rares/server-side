

import {

  ProjectedCategory,
} from "@/modules/category/types";

export interface ICategoryService {
  findAllCategoryList(): Promise<ProjectedCategory<"SUMMARY">[]>;
}
