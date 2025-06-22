import { UpdateProductRequestType } from "../../schemas";
import { ProductUpdateCommand } from "../../services/commands/product-update.command";
import {
  ProductImageCommandType,
  VariantCreateCommandType,
  VariantUpdateCommandType,
} from "../../schemas/update/update-product.command.schema";

export class ProductUpdateInputAssembler {
  static assemble(
    productId: string,
    dto: UpdateProductRequestType,
    files?: Express.Multer.File[]
  ): ProductUpdateCommand {
    const uploadedMap = dto.uploadedMap || {};

    const resolveImages = (
      images?: { tempId: string }[]
    ): ProductImageCommandType[] | undefined => {
      if (!images) return undefined;
      return images.map((img) => {
        const index = uploadedMap[img.tempId];
        const file = index !== undefined ? files?.[index] : undefined;
        return {
          tempId: img.tempId,
          url: file ? `/images/products/${file.filename}` : "",
          alt: file ? file.originalname : "",
          isPrimary: false,
        };
      });
    };

    const resolvedImageOperations = dto.imageOperations
      ? {
          add: resolveImages(dto.imageOperations.add),
          delete: dto.imageOperations.delete,
          order: dto.imageOperations.order,
        }
      : undefined;

    const resolvedVariantAdds = dto.variantOperations?.add?.map(
      (variant): VariantCreateCommandType => ({
        ...variant,
        images: resolveImages(variant.images),
      })
    );

    const resolvedVariantUpdates = dto.variantOperations?.update?.map(
      (variant): VariantUpdateCommandType => ({
        ...variant,
        images: {
          ...variant.images,
          add: resolveImages(variant.images?.add),
        },
      })
    );

    return {
      productId,
      productDomain: dto.productDomain,
      imageOperations: resolvedImageOperations,
      inventory: dto.inventory,
      variantOperations:
        resolvedVariantAdds ||
        resolvedVariantUpdates ||
        dto.variantOperations?.remove
          ? {
              add: resolvedVariantAdds,
              update: resolvedVariantUpdates,
              remove: dto.variantOperations?.remove,
            }
          : undefined,
      reason: dto.reason,
    };
  }
}
