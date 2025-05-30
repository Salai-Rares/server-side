import { Document } from "mongoose";
import { ICategoryService } from "../types/category.service.types";
import { inject, injectable } from "inversify";
import {CATEGORY_PROJECTIONS} from "../constants"
import {
  
  ICategoryRepository,
  ProjectedCategory,
  ProjectionCategoryKey,
  ProjectionCategoryMap,
} from "../types/category.repository.types";
import { TYPES } from "@/shared/types";
import { CategoryBaseSchema, CategoryBaseSchemaDto, CategoryResponseDto, CreateCategoryDto } from "../schemas/category.dto";
import { RepositoryOptions } from "@/shared/types/repository.types"
import { z } from "zod";
@injectable()
export class CategoryService implements ICategoryService {
  constructor(
    @inject(TYPES.CategoryRepository)
    private categoryRepository: ICategoryRepository
  ) {
    
  }
  async findAllCategoryList(): Promise<ProjectedCategory<"SUMMARY">[]> {
    const schema = this.createDynamicResponseZodObject("SUMMARY", CATEGORY_PROJECTIONS, CategoryBaseSchema.shape)
    const options : RepositoryOptions<ProjectedCategory<"SUMMARY">> = {projection:CATEGORY_PROJECTIONS.SUMMARY}
    const data = await this.categoryRepository.findAllCategories(options);
    console.log('data returned',data)
    const result =  schema.parse(data);
    return result as ProjectedCategory<"SUMMARY">[];
  }

  private createDynamicResponseZodObject(key: ProjectionCategoryKey,projectionMap :ProjectionCategoryMap,categoryBaseSchema:typeof CategoryBaseSchema.shape,) {
   const zodMappedObject :  Record<string, z.ZodTypeAny> = {};
   const projectionObject = projectionMap[key];
   const projectionObjectKeys = Object.keys(projectionObject);
   projectionObjectKeys.forEach((key)=>{
    const typedKey = key as keyof typeof categoryBaseSchema;
    zodMappedObject[key] = categoryBaseSchema[typedKey] 
   })
    const zodObject = z.array(z.object(zodMappedObject));
    return zodObject;
  }
}
