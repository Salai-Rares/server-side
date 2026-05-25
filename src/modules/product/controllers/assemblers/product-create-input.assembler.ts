import { CreateProductType, CreateProductSchema, ProductImageType } from "../../schemas";


export class ProductCreateInputAssembler {
static assemble(
  body: any,
  files: Express.Multer.File[]
): CreateProductType {
  // Parse the JSON string BEFORE passing to Zod
  const productData = JSON.parse(body.product); // ← ADD THIS
  
  const processed = this.processUploadedProductImages(files, body);

  if (processed.productImages) {
    productData.images = processed.productImages;
  }

  if (processed.variantImages && productData.variants) {
    Object.entries(processed.variantImages).forEach(([index, images]) => {
      productData.variants[+index].images = images;
    });
  }

  // Now Zod receives an object, not a string
  return CreateProductSchema.parse(productData); // ← Changed
}

  private static processUploadedProductImages(
    files: Express.Multer.File[],
    body: any
  ): {
    productImages?: ProductImageType[];
    variantImages?: Record<number, ProductImageType[]>;
  } {
    const fileGroups = files.reduce((acc, file) => {
      if (!acc[file.fieldname]) acc[file.fieldname] = [];
      acc[file.fieldname].push(file);
      return acc;
    }, {} as Record<string, Express.Multer.File[]>);

    const processed: {
      productImages?: ProductImageType[];
      variantImages?: Record<number, ProductImageType[]>;
    } = {};

    if (fileGroups.images) {
     
      processed.productImages = fileGroups.images.map((file, index) => ({
        url: `/images/products/${file.filename}`,
        alt: file.filename,
      }));
    }

    Object.keys(fileGroups).forEach((fieldName) => {
      const match = fieldName.match(/variantImages\[(\d+)\]/);
      if (match) {
        const variantIndex = parseInt(match[1]);
        if (!processed.variantImages) processed.variantImages = {};
        processed.variantImages[variantIndex] = fileGroups[fieldName].map(
          (file, index) => ({
            url: `/images/products/${file.filename}`,
            alt: file.filename,
          })
        );
      }
    });

    return processed;
  }
}
