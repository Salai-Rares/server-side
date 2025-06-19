import { Request } from 'express';
import { CreateProductDTO } from '../../modules/product/schemas/product.dto';

declare global {
  namespace Express {
    export interface Request {
      file?: Express.Multer.File; // Add the `file` property for file uploads
      validateData?:CreateProductDTO;
      files?: Express.Multer.File[];
      // processedImages?: {
      //   productImages?: ProductImageType[];
      //   variantImages?: Record<number, ProductImageType[]>;
      // };
    }
  }
}