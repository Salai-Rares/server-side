import { z } from "zod";
import { InventorySchema } from "@/modules/inventory/schemas/inventory.dto";
import { PRODUCT_LIMITS } from "../constants/product-validation.constants";
import {
  ProductCoreSchema,
  VariantBaseSchema,
  RatingSummarySchema,
  objectIdSchema,
} from "./shared.schema";

// ===============================
// CREATION SCHEMAS
// ===============================

export const VariantWithInventorySchema = VariantBaseSchema.extend({
  inventory: InventorySchema.optional(),
}).strip();

export const CreateProductSchema = ProductCoreSchema.extend({
  variants: z
    .array(VariantWithInventorySchema)
    .max(PRODUCT_LIMITS.VARIANTS.MAX_COUNT)
    .optional(),
  inventory: InventorySchema.optional(),
  ratings: RatingSummarySchema.optional().default({
    average: PRODUCT_LIMITS.RATINGS.DEFAULT,
    count: PRODUCT_LIMITS.RATINGS.DEFAULT,
    distribution: {
      1: PRODUCT_LIMITS.RATINGS.DEFAULT,
      2: PRODUCT_LIMITS.RATINGS.DEFAULT,
      3: PRODUCT_LIMITS.RATINGS.DEFAULT,
      4: PRODUCT_LIMITS.RATINGS.DEFAULT,
      5: PRODUCT_LIMITS.RATINGS.DEFAULT,
    },
  }),
  reviewsCount: z
    .number()
    .min(PRODUCT_LIMITS.RATINGS.MIN_COUNT)
    .optional()
    .default(PRODUCT_LIMITS.RATINGS.DEFAULT),
});

// ===============================
// RESPONSE SCHEMA
// ===============================

export const ProductResponseSchema = ProductCoreSchema.extend({
  _id: objectIdSchema.transform((id) => id.toString()),
  slug: z.string().min(1),
  variants: z.array(VariantBaseSchema).optional(),
  ratings: RatingSummarySchema,
  reviewsCount: z.number(),
  createdAt: z.date().transform((d) => d.toISOString()),
  updatedAt: z.date().transform((d) => d.toISOString()),
}).transform(({ _id, ...rest }) => ({
  id: _id,
  ...rest,
}));

// ===============================
// EXPORTED TYPES
// ===============================

export type CreateProductType = z.infer<typeof CreateProductSchema>;
export type ProductResponseType = z.infer<typeof ProductResponseSchema>;
export type VariantWithInventoryType = z.infer<typeof VariantWithInventorySchema>;