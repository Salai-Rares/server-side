import { NextFunction } from "express";
import { ProductImageType } from "../schemas";
import { Request,Response} from "express";
export interface ProcessedRequest extends Request {
  processedImages?: {
    productImages?: ProductImageType[];
    variantImages?: Record<number, ProductImageType[]>;
  };
}

// Clean middleware that processes images
export const processImagesMiddleware = (req: ProcessedRequest, res: Response, next: NextFunction) => {
  const files = req.files as Express.Multer.File[];
  
  if (!files || files.length === 0) {
    return next(); // No images, continue
  }

  // Simple file grouping by field name
  const fileGroups = files.reduce((acc, file) => {
    if (!acc[file.fieldname]) acc[file.fieldname] = [];
    acc[file.fieldname].push(file);
    return acc;
  }, {} as Record<string, Express.Multer.File[]>);

  // Process product images
  if (fileGroups.images) {
    const primaryIndex = Number(req.body.primaryImageIndex || 0);
    req.processedImages = {
      productImages: fileGroups.images.map((file, index) => ({
        url: `/images/products/${file.filename}`,
        alt: file.filename,
 
      }))
    };
  }

  // Process variant images (if any)
  Object.keys(fileGroups).forEach(fieldName => {
    const match = fieldName.match(/variantImages\[(\d+)\]/);
    if (match) {
      const variantIndex = parseInt(match[1]);
      if (!req.processedImages) req.processedImages = {};
      if (!req.processedImages.variantImages) req.processedImages.variantImages = {};
      
      req.processedImages.variantImages[variantIndex] = fileGroups[fieldName].map((file, index) => ({
        url: `/images/products/${file.filename}`,
        alt: file.filename,
 
      }));
    }
  });

  next();
};