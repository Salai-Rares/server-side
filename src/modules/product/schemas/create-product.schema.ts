import { z } from "zod";
import { InventorySchema } from "@/modules/inventory/schemas/inventory.dto";
import { PRODUCT_LIMITS } from "../constants/product-validation.constants";
import {
  ProductDraftSchema,
  VariantDraftSchema,
  RatingSummarySchema,
  objectIdSchema,
} from "./shared.schema";
import { DiscountZodSchema } from "@/modules/discount/schemas/discount.schema";

// ===============================
// CREATION SCHEMAS
// ===============================

export const VariantWithInventorySchema = VariantDraftSchema.extend({
  inventory: InventorySchema.optional(),
  discountData: DiscountZodSchema.optional(),
}).strip();

export const CreateProductSchema = ProductDraftSchema.extend({
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
  discountData: DiscountZodSchema.optional(),
});

// ===============================
// RESPONSE SCHEMA
// ===============================

export const ProductResponseSchema = ProductDraftSchema.extend({
  _id: objectIdSchema.transform((id) => id.toString()),
  slug: z.string().min(1),
  variants: z.array(VariantDraftSchema).optional(),
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
export type VariantWithInventoryType = z.infer<
  typeof VariantWithInventorySchema
>;
