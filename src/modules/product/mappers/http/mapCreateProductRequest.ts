import { Request } from "express";
import { CreateProductDto } from "../../schemas";
import { ProductVariant } from "../../types";
export function mapCreateProductRequest(req: Request): CreateProductDto {
    const product = req.body.product;
    const variants = product.variants || [];
    const files = req.files as Express.Multer.File[];
  
    // 1. Parse primary image selections
    const mainPrimaryIndex = Number(req.body.primaryImageIndex ?? 0);
    const variantPrimaryIndices = Array.isArray(req.body.variantPrimary)
      ? req.body.variantPrimary.map(Number)
      : [Number(req.body.variantPrimary || 0)];
  
    // 2. Create file mapping
    const fileMap = files.reduce((acc, file) => {
      (acc[file.fieldname] ||= []).push(file);
      return acc;
    }, {} as Record<string, Express.Multer.File[]>);
  
    // 3. Process variants
    if (variants.length > 0) {
      variants.forEach((variant: ProductVariant, variantIndex: number) => {
        const key = `variantImages[${variantIndex}]`;
        const variantFiles = fileMap[key] || [];
        const primaryIndex = variantPrimaryIndices[variantIndex] || 0;
  
        variant.images = variantFiles.map((file, fileIndex) => ({
          url: `/images/products/${file.filename}`,
          alt: `${file.filename}`,
          isPrimary: fileIndex === primaryIndex,
        }));
      });
      product.variants = variants;
    }
  
    // 4. Process product images
    const productImages = fileMap["images"] || [];
    product.images = productImages.map((file, index) => ({
      url: `/images/products/${file.filename}`,
      alt: `${file.filename}`,
      isPrimary: index === mainPrimaryIndex,
    }));
  
    return product;
  }