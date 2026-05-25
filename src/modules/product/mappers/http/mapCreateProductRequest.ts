import { Request } from "express";

import { ProductVariant } from "../../types";
import { CreateProductType, VariantWithInventoryType } from "../../schemas/create-product.schema";
export function mapCreateProductRequest(req: Request): CreateProductType {
    const product = req.body.product;
    const variants = product.variants || [];
    const files = req.files as Express.Multer.File[];
    // 1. Parse primary image selections
  
  
    // 2. Create file mapping
    const fileMap = files.reduce((acc, file) => {
      (acc[file.fieldname] ||= []).push(file);
      return acc;
    }, {} as Record<string, Express.Multer.File[]>);
  
    // 3. Process variants
    if (variants.length > 0) {
      variants.forEach((variant: VariantWithInventoryType, variantIndex: number) => {
        const key = `variantImages[${variantIndex}]`;
        const variantFiles = fileMap[key] || [];
     
  
        variant.images = variantFiles.map((file, fileIndex) => ({
          url: `/images/products/${file.filename}`,
          alt: `${file.filename}`,
      
        }));
      });
      product.variants = variants;
    }

    // 4. Process product images
    const productImages = fileMap["images"] || [];
    product.images = productImages.map((file, index) => ({
      url: `/images/products/${file.filename}`,
      alt: `${file.filename}`,

    }));
  
    return product;
  }