import { z } from "zod";
import {
  InventorySchema,
  UpdateInventoryByIDSchema,
} from "@/modules/inventory/schemas/inventory.dto";
import { isValidObjectId } from "@/shared/utils";
import { PRODUCT_LIMITS } from "../constants/product-validation.constants";
import {
  PriceSchema,
  DiscountSchema,
  SeoMetaSchema,
  ProductImageSchema,
  AttributeSchema,
  VariantBaseSchema,
} from "./shared.schema";

// ===============================
// UPDATE PARTIALS
// ===============================

const UpdatePriceSchema = PriceSchema.partial().strip();
const UpdateDiscountSchema = DiscountSchema.partial().strip();
const UpdateSeoMetaSchema = SeoMetaSchema.partial().strip();

export const TempImageRefSchema = z.object({
  tempId: z.string(),
});

const ImageOperationsSchema = z
  .object({
    add: z.array(TempImageRefSchema).optional(),
    delete: z.array(z.string()).optional(), // publicIds to delete
    order: z.array(z.string()).optional(), // tempIds + publicIds in final order
  })
  .strip();

// ===============================
// DOMAIN UPDATE SCHEMAS (Clean Entity Updates)
// ===============================
// For creating new variants (no ID required)
const VariantCreateSchema = VariantBaseSchema.extend({
  inventory: InventorySchema.optional(),
  images: z.array(TempImageRefSchema).optional(),
}).strip();

// For updating existing variants (ID required)
const VariantUpdateSchema = z
  .object({
    id: z.string(),
    productOptions: z.record(z.string()).optional(),
    price: UpdatePriceSchema.nullable().optional(),
    inventory: UpdateInventoryByIDSchema.optional(),
    images: ImageOperationsSchema.optional(), // Granular image operations for variants
  })
  .strip();

const VariantOperationsSchema = z
  .object({
    add: z.array(VariantCreateSchema).optional(),
    update: z.array(VariantUpdateSchema).optional(),
    remove: z.array(z.string()).optional(), // Array of variant IDs
  })
  .strip();

export const ProductDomainUpdateSchema = z
  .object({
    name: z
      .string()
      .min(PRODUCT_LIMITS.NAME.MIN_LENGTH)
      .max(PRODUCT_LIMITS.NAME.MAX_LENGTH)
      .optional(),
    description: z
      .string()
      .min(PRODUCT_LIMITS.DESCRIPTION.MIN_LENGTH)
      .max(PRODUCT_LIMITS.DESCRIPTION.MAX_LENGTH)
      .optional(),
    shortDescription: z
      .string()
      .max(PRODUCT_LIMITS.SHORT_DESCRIPTION.MAX_LENGTH)
      .nullable()
      .optional(),
    brand: z
      .string()
      .refine(isValidObjectId, {
        message: "Invalid MongoDB ID format",
      })
      .nullable()
      .optional(),
    categories: z
      .array(
        z.string().refine(isValidObjectId, {
          message: "Invalid MongoDB ID format",
        })
      )
      .min(PRODUCT_LIMITS.CATEGORIES.MIN_COUNT)
      .max(PRODUCT_LIMITS.CATEGORIES.MAX_COUNT)
      .optional(),
    tags: z
      .array(z.string().max(PRODUCT_LIMITS.TAGS.TAG_MAX_LENGTH))
      .max(PRODUCT_LIMITS.TAGS.MAX_COUNT)
      .nullable()
      .optional(),
    price: UpdatePriceSchema.optional(),
    discount: UpdateDiscountSchema.nullable().optional(),
    isFeatured: z.boolean().nullable().optional(),
    seo: UpdateSeoMetaSchema.nullable().optional(),
    attributes: z
      .array(AttributeSchema)
      .max(PRODUCT_LIMITS.ATTRIBUTES.MAX_COUNT)
      .nullable()
      .optional(),
  })
  .strip();

// ===============================
// SERVICE-LAYER SCHEMAS
// ===============================

export const UpdateProductRequestSchema = z
  .object({
    productDomain: ProductDomainUpdateSchema.optional(),
    imageOperations: ImageOperationsSchema.optional(),
    inventory: UpdateInventoryByIDSchema.optional(),
    variantOperations: VariantOperationsSchema.optional(),
    reason: z.string().max(PRODUCT_LIMITS.AUDIT.REASON_MAX_LENGTH).optional(),
    uploadedMap: z.record(z.string(), z.coerce.number()).optional(),
  })
  .strip()
  .superRefine((data, ctx) => {
    const {
      productDomain,
      inventory,
      variantOperations,
      imageOperations,
      uploadedMap,
    } = data;

    const noUpdates =
      !productDomain && !inventory && !variantOperations && !imageOperations;

    if (noUpdates) {
      ctx.addIssue({
        path: [],
        code: z.ZodIssueCode.custom,
        message: "At least one field must be provided for update",
      });
    }

    const hasImageAdd = imageOperations?.add?.length;
    const hasVariantAddWithImages = variantOperations?.add?.some(
      (v) => v.images?.length
    );

    if ((hasImageAdd || hasVariantAddWithImages) && !uploadedMap) {
      ctx.addIssue({
        path: ["uploadedMap"],
        code: z.ZodIssueCode.custom,
        message: "uploadedMap is required when adding new images",
      });
    }

    if (uploadedMap && !hasImageAdd && !hasVariantAddWithImages) {
      ctx.addIssue({
        path: ["uploadedMap"],
        code: z.ZodIssueCode.custom,
        message:
          "uploadedMap is not expected while we don't have any added image",
      });
    }

    if (uploadedMap && (hasImageAdd || hasVariantAddWithImages)) {
      let expectedCount = imageOperations?.add?.length ?? 0;

      expectedCount +=
        variantOperations?.add?.reduce((acc, variant) => {
          return acc + (variant.images?.length ?? 0);
        }, 0) ?? 0;

      const uploadedCount = Object.keys(uploadedMap).length;

      if (uploadedCount !== expectedCount) {
        ctx.addIssue({
          path: ["uploadedMap"],
          code: z.ZodIssueCode.custom,
          message: `Mismatch in uploadedMap count. Expected ${expectedCount}, got ${uploadedCount}`,
        });
      }
    }

    if (uploadedMap && (hasImageAdd || hasVariantAddWithImages)) {
      const validTempIds = new Set(Object.keys(uploadedMap));

      const usedTempIds: string[] = [];

      // Collect tempIds from root imageOperations
      imageOperations?.add?.forEach((img) => {
        if (img.tempId) usedTempIds.push(img.tempId);
      });

      // Collect tempIds from variantOperations.add images
      variantOperations?.add?.forEach((variant) => {
        variant.images?.forEach((img) => {
          if (img.tempId) usedTempIds.push(img.tempId);
        });
      });

      // Check for unexpected or missing tempIds
      for (const tempId of usedTempIds) {
        if (!validTempIds.has(tempId)) {
          ctx.addIssue({
            path: ["uploadedMap"],
            code: z.ZodIssueCode.custom,
            message: `Temp ID "${tempId}" used in image references is missing in uploadedMap`,
          });
        }
      }

      for (const mapKey of validTempIds) {
        if (!usedTempIds.includes(mapKey)) {
          ctx.addIssue({
            path: ["uploadedMap"],
            code: z.ZodIssueCode.custom,
            message: `uploadedMap contains unused tempId "${mapKey}"`,
          });
        }
      }
      // Duplicate check
      const tempIdCounts = usedTempIds.reduce<Record<string, number>>(
        (acc, id) => {
          acc[id] = (acc[id] || 0) + 1;
          return acc;
        },
        {}
      );

      Object.entries(tempIdCounts).forEach(([tempId, count]) => {
        if (count > 1) {
          ctx.addIssue({
            path: ["uploadedMap"],
            code: z.ZodIssueCode.custom,
            message: `Temp ID "${tempId}" is used ${count} times — must be unique`,
          });
        }
      });
    }
  });

// ===============================
// EXPORTED TYPES
// ===============================

export type UpdateProductRequestType = z.infer<
  typeof UpdateProductRequestSchema
>;
export type ProductDomainUpdateType = z.infer<typeof ProductDomainUpdateSchema>;

export type VariantOperationsType = z.infer<typeof VariantOperationsSchema>;
export type UpdatePriceType = z.infer<typeof UpdatePriceSchema>;
export type UpdateDiscountType = z.infer<typeof UpdateDiscountSchema>;
export type UpdateSeoMetaType = z.infer<typeof UpdateSeoMetaSchema>;
// Image operation types
export type ImageOperationsType = z.infer<typeof ImageOperationsSchema>;

// Variant operation types
export type VariantCreateType = z.infer<typeof VariantCreateSchema>;
export type VariantUpdateType = z.infer<typeof VariantUpdateSchema>;
