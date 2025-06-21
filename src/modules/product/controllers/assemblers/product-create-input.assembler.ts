import { CreateProductType, CreateProductSchema, ProductImageType } from "../../schemas";


export class ProductCreateInputAssembler {
  static assemble(
    body: any,
    files: Express.Multer.File[]
  ): CreateProductType {
    const processed = this.processUploadedProductImages(files, body);

    if (processed.productImages) {
      body.product.images = processed.productImages;
    }

    if (processed.variantImages && body.product.variants) {
      Object.entries(processed.variantImages).forEach(([index, images]) => {
        body.product.variants[+index].images = images;
      });
    }

    return CreateProductSchema.parse(body.product);
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
      const primaryIndex = Number(body.primaryImageIndex || 0);
      processed.productImages = fileGroups.images.map((file, index) => ({
        url: `/images/products/${file.filename}`,
        alt: file.filename,
        isPrimary: index === primaryIndex,
      }));
    }

    Object.keys(fileGroups).forEach((fieldName) => {
      const match = fieldName.match(/variantImages\[(\d+)\]/);
      if (match) {
        const variantIndex = parseInt(match[1]);
        const variantPrimary = Array.isArray(body.variantPrimary)
          ? Number(body.variantPrimary[variantIndex] || 0)
          : 0;

        if (!processed.variantImages) processed.variantImages = {};
        processed.variantImages[variantIndex] = fileGroups[fieldName].map(
          (file, index) => ({
            url: `/images/products/${file.filename}`,
            alt: file.filename,
            isPrimary: index === variantPrimary,
          })
        );
      }
    });

    return processed;
  }
}
