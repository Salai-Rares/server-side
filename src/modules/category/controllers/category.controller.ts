import { inject } from "inversify";
import { BaseHttpController, controller, httpGet, httpPost } from "inversify-express-utils";
import { createMulterUpload } from "../../../middleware/multer/fileUpload.middleware";
import path from "path";
import { TYPES } from "@/shared/types";
import { ICategoryService } from "../types/category.service.types";
import { RequestScopedStorage } from "../../../core/request-context/request-scoped.storage";
import { CreateCategoryDto } from "../schemas/category.dto";
import { cleanupUploadedFiles } from "../../../middleware/multer/cleanupUploadedFiles.middleware";
import {Request,Response} from "express"

const categoryImageUpload = createMulterUpload({
  destination: path.resolve(__dirname, "../images/categories"),
  mimetypes: {
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/jpg": "jpg"
  },
  fileSize: 5 * 1024 * 1024 // 5MB
})


@controller("/api/v1/categories")
export class CategoryController extends BaseHttpController {
  constructor(
   
    @inject(TYPES.CategoryService) private categoryService:ICategoryService,
  ) {
      super();
  }
 
  
  

  @httpPost("/category/add",categoryImageUpload.single("image"),cleanupUploadedFiles,TYPES.ValidateCreateCategory,)
  async addCategory(req:Request , res:Response):Promise<void> {
    const result = CreateCategoryDto.safeParse(req.body);
    console.log('body',req.body)
    console.log(result)
    if (!result.success) {
       res.status(400).json({ errors: result.error.flatten() });
       return ;
    }
    // const category = await this.categoryService.addCategory(result.data);
    //  res.status(201).json(category);
     return
  }

  @httpGet("/category/findall")
  async findAllCategories(req:Request,res:Response):Promise<void> {
    const result = await this.categoryService.findAllCategoryList();
    
   
    res.status(200).json({
      success:true,
      data:result
    })
    return;
  }
}

