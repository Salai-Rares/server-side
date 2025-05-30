import { inject, injectable } from "inversify";
import { ICategoryDocument } from "../models/category.model";
import { CreateCategoryDto, UpdateCategoryDto } from "../schemas";
import { TYPES } from "@/shared/types";
import { ICategoryCacheRepository, ICategoryRepository } from "@/modules/category/types";
@injectable()
export class CategoryCacheRepository implements ICategoryCacheRepository{
    private readonly cateogryCacheKey:string = 'category';
    constructor(@inject(TYPES.CategoryRepository) private inner:ICategoryRepository){

    }
    createCategory(categoryData: CreateCategoryDto): Promise<ICategoryDocument> {
        throw new Error("Method not implemented.");
    }
    findCategoryById(id: string): Promise<ICategoryDocument | null> {
        throw new Error("Method not implemented.");
    }
    findCategoryByPath(path: string): Promise<ICategoryDocument | null> {
        throw new Error("Method not implemented.");
    }
    updateCategory(id: string, categoryData: UpdateCategoryDto): Promise<ICategoryDocument | null> {
        throw new Error("Method not implemented.");
    }
    deleteCategory(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    findAllCategories(): Promise<ICategoryDocument[]> {
        throw new Error("Method not implemented.");
    }

}