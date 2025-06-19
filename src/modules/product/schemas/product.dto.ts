// import { z } from "zod";
// import { Types } from "mongoose";
// import {
//   InventorySchema,
//   UpdateInventorySchema,
// } from "@/modules/inventory/schemas/inventory.dto";
// import { isValidObjectId } from "@/shared/utils";
// import { PRODUCT_LIMITS } from "../constants/product-validation.constants";






// const VariantBaseSchema = z
//   .object({
//     sku: z
//       .string()
//       .min(PRODUCT_LIMITS.SKU.MIN_LENGTH)
//       .max(PRODUCT_LIMITS.SKU.MAX_LENGTH),
//     productOptions: z.record(z.string()),
//     price: PriceSchema.optional(),
//     images: z
//       .array(ProductImageSchema)
//       .max(PRODUCT_LIMITS.IMAGES.MAX_COUNT)
//       .optional(),
//   })
//   .strip();

// const VariantWithInventorySchema = VariantBaseSchema.extend({
//   inventory: InventorySchema.optional(),
// }).strip();

// const RatingSummarySchema = z
//   .object({
//     average: z
//       .number()
//       .min(PRODUCT_LIMITS.RATINGS.MIN_AVERAGE)
//       .max(PRODUCT_LIMITS.RATINGS.MAX_AVERAGE),
//     count: z.number().min(PRODUCT_LIMITS.RATINGS.MIN_COUNT),
//     distribution: z
//       .object({
//         1: z.coerce.number().min(PRODUCT_LIMITS.RATINGS.DEFAULT),
//         2: z.coerce.number().min(PRODUCT_LIMITS.RATINGS.DEFAULT),
//         3: z.coerce.number().min(PRODUCT_LIMITS.RATINGS.DEFAULT),
//         4: z.coerce.number().min(PRODUCT_LIMITS.RATINGS.DEFAULT),
//         5: z.coerce.number().min(PRODUCT_LIMITS.RATINGS.DEFAULT),
//       })
//       .strip(),
//   })
//   .strip();

// const SeoMetaSchema = z
//   .object({
//     title: z
//       .string()
//       .min(PRODUCT_LIMITS.SEO.TITLE_MIN_LENGTH)
//       .max(PRODUCT_LIMITS.SEO.TITLE_MAX_LENGTH),
//     description: z
//       .string()
//       .min(PRODUCT_LIMITS.SEO.DESCRIPTION_MIN_LENGTH)
//       .max(PRODUCT_LIMITS.SEO.DESCRIPTION_MAX_LENGTH),
//     keywords: z
//       .array(z.string().max(PRODUCT_LIMITS.SEO.KEYWORD_MAX_LENGTH))
//       .max(PRODUCT_LIMITS.SEO.KEYWORDS_MAX_COUNT),
//     cannonicalUrl: z
//       .string()
//       .url()
//       .max(PRODUCT_LIMITS.SEO.CANONICAL_URL_MAX_LENGTH),
//   })
//   .strip();
// const AttributeSchema = z
//   .object({
//     key: z.string().min(1).max(PRODUCT_LIMITS.ATTRIBUTES.KEY_MAX_LENGTH),
//     value: z
//       .array(z.string().max(PRODUCT_LIMITS.ATTRIBUTES.VALUE_MAX_LENGTH))
//       .nonempty()
//       .max(PRODUCT_LIMITS.ATTRIBUTES.VALUES_MAX_COUNT),
//   })
//   .strip();

// const ProductStatusEnum = z.enum(PRODUCT_LIMITS.STATUS.DEFAULT);

// export const ProductBaseSchema = z
//   .object({
//     sku: z
//       .string()
//       .min(PRODUCT_LIMITS.SKU.MIN_LENGTH)
//       .max(PRODUCT_LIMITS.SKU.MAX_LENGTH),
//     name: z
//       .string()
//       .min(PRODUCT_LIMITS.NAME.MIN_LENGTH)
//       .max(PRODUCT_LIMITS.NAME.MAX_LENGTH),
//     description: z
//       .string()
//       .min(PRODUCT_LIMITS.DESCRIPTION.MIN_LENGTH)
//       .max(PRODUCT_LIMITS.DESCRIPTION.MAX_LENGTH),
//     shortDescription: z
//       .string()
//       .max(PRODUCT_LIMITS.SHORT_DESCRIPTION.MAX_LENGTH)
//       .optional(),
//     brand: z
//       .string()
//       .refine(isValidObjectId, {
//         message: "Invalid MongoDB ID format",
//       })
//       .optional(),
//     categories: z
//       .array(
//         z.string().refine(isValidObjectId, {
//           message: "Invalid MongoDB ID format",
//         })
//       )
//       .min(PRODUCT_LIMITS.CATEGORIES.MIN_COUNT)
//       .max(PRODUCT_LIMITS.CATEGORIES.MAX_COUNT),
//     tags: z
//       .array(z.string().max(PRODUCT_LIMITS.TAGS.TAG_MAX_LENGTH))
//       .max(PRODUCT_LIMITS.TAGS.MAX_COUNT)
//       .optional(),
//     images: z
//       .array(ProductImageSchema)
//       .min(PRODUCT_LIMITS.IMAGES.MIN_COUNT)
//       .max(PRODUCT_LIMITS.IMAGES.MAX_COUNT),
//     price: PriceSchema,
//     discount: DiscountSchema,

//     variants: z
//       .array(VariantBaseSchema)
//       .max(PRODUCT_LIMITS.VARIANTS.MAX_COUNT)
//       .optional(),
//     //used for promotions like banners and so on (in the future when I have multiple record databases maybe change the logic to something like promote last added products)
//     isFeatured: z.boolean().optional(),
//     status: ProductStatusEnum.default("draft"),

//     ratings: RatingSummarySchema,
//     reviewsCount: z.number(),

//     seo: SeoMetaSchema.optional(),
//     attributes: z.array(AttributeSchema).optional(),
//   })
//   .strip();

// export const CreateProductWithInventoryDto = ProductBaseSchema.extend({
//   variants: z
//     .array(VariantWithInventorySchema)
//     .max(PRODUCT_LIMITS.VARIANTS.MAX_COUNT)
//     .optional(),
//   inventory: InventorySchema.optional(),
//   ratings: RatingSummarySchema.optional().default({
//     average: PRODUCT_LIMITS.RATINGS.DEFAULT,
//     count: PRODUCT_LIMITS.RATINGS.DEFAULT,
//     distribution: {
//       1: PRODUCT_LIMITS.RATINGS.DEFAULT,
//       2: PRODUCT_LIMITS.RATINGS.DEFAULT,
//       3: PRODUCT_LIMITS.RATINGS.DEFAULT,
//       4: PRODUCT_LIMITS.RATINGS.DEFAULT,
//       5: PRODUCT_LIMITS.RATINGS.DEFAULT,
//     },
//   }),
//   reviewsCount: z
//     .number()
//     .min(PRODUCT_LIMITS.RATINGS.MIN_COUNT)
//     .optional()
//     .default(PRODUCT_LIMITS.RATINGS.DEFAULT),
// });

// const UpdatePriceSchema = PriceSchema.partial().strip();
// const UpdateSeoMetaSchema = SeoMetaSchema.partial().strip();
// const UpdateVariantBaseSchema = VariantBaseSchema.omit({ sku: true })
//   .extend({ id: z.string() })
//   .partial()
//   .required({ id: true })
//   .strip();
// const VariantOperationsSchema = z
//   .object({
//     add: z
//       .array(
//         VariantBaseSchema.extend({
//           inventory: InventorySchema.optional(),
//         })
//       )
//       .optional(),
//     update: z
//       .array(
//         UpdateVariantBaseSchema.extend({
//           inventory: UpdateInventorySchema.optional(),
//         })
//       )
//       .optional(),
//     delete: z.array(z.string()).optional(),
    
//   })
//   .strip();

// const UpdateDiscountSchema = DiscountSchema.partial();
// // Base update schema - for updates without inventory management
// const UpdateProductBaseDtoSchema = z
//   .object({
//     name: z
//       .string()
//       .min(PRODUCT_LIMITS.NAME.MIN_LENGTH)
//       .max(PRODUCT_LIMITS.NAME.MAX_LENGTH)
//       .optional(),
//     description: z
//       .string()
//       .min(PRODUCT_LIMITS.DESCRIPTION.MIN_LENGTH)
//       .max(PRODUCT_LIMITS.DESCRIPTION.MAX_LENGTH)
//       .optional(),
//     shortDescription: z
//       .string()
//       .max(PRODUCT_LIMITS.SHORT_DESCRIPTION.MAX_LENGTH)
//       .nullable()
//       .optional(),
//     brand: z
//       .string()
//       .refine(isValidObjectId, {
//         message: "Invalid MongoDB ID format",
//       })
//       .nullable()
//       .optional(),
//     categories: z
//       .array(
//         z.string().refine(isValidObjectId, {
//           message: "Invalid MongoDB ID format",
//         })
//       )
//       .min(PRODUCT_LIMITS.CATEGORIES.MIN_COUNT)
//       .max(PRODUCT_LIMITS.CATEGORIES.MAX_COUNT)
//       .optional(),
//     tags: z
//       .array(z.string().max(PRODUCT_LIMITS.TAGS.TAG_MAX_LENGTH))
//       .max(PRODUCT_LIMITS.TAGS.MAX_COUNT)
//       .nullable()
//       .optional(), // null = clear, array = update, undefined = no change
//     images: z
//       .array(ProductImageSchema)
//       .min(PRODUCT_LIMITS.IMAGES.MIN_COUNT)
//       .max(PRODUCT_LIMITS.IMAGES.MAX_COUNT)
//       .optional(),
//     price: UpdatePriceSchema.optional(),
//     discount: UpdateDiscountSchema.partial().nullable().optional(), // null = clear, object = update, undefined = no change
//     variantOpeartions: VariantOperationsSchema.optional(),
//     isFeatured: z.boolean().nullable().optional(), // null = clear, boolean = update, undefined = no change
//     seo: UpdateSeoMetaSchema.nullable().optional(), // null = clear, object = update, undefined = no change
//     attributes: z
//       .array(AttributeSchema)
//       .max(PRODUCT_LIMITS.ATTRIBUTES.MAX_COUNT)
//       .nullable()
//       .optional(),
//     reason: z.string().max(PRODUCT_LIMITS.AUDIT.REASON_MAX_LENGTH).optional(), // For audit trail
//   })
//   .strip();

// export const UpdateProductDto = UpdateProductBaseDtoSchema.refine(
//   (data) => Object.keys(data).length > 0,
//   { message: "At least one field must be provided for update" }
// );

// export const UpdateProductWithInventoryDto = UpdateProductBaseDtoSchema.extend({
//   inventory: UpdateInventorySchema.optional(), // null = clear, object = update, undefined = no change
// })
//   .strip()
//   .refine((data) => Object.keys(data).length > 0, {
//     message: "At least one field must be provided for update",
//   });

// export const ProductResponseDto = ProductBaseSchema.extend({
//   _id: objectIdSchema.transform((id) => id.toString()),
//   slug: z.string().min(1),
//   createdAt: z.date().transform((d) => d.toISOString()),
//   updatedAt: z.date().transform((d) => d.toISOString()),
// }).transform(({ _id, ...rest }) => ({
//   id: _id,
//   ...rest,
// }));

// export type CreateProductWithInventoryDto = z.infer<
//   typeof CreateProductWithInventoryDto
// >;
// export type UpdateProductBaseType = z.infer<typeof UpdateProductDto>;
// export type UpdateProductWithInventoryDto = z.infer<
//   typeof UpdateProductWithInventoryDto
// >;
// export type ProductResponseDto = z.infer<typeof ProductResponseDto>;
// export type ProductStatusType = z.infer<typeof ProductStatusEnum>;
// export type VariantWithInventoryType = z.infer<
//   typeof VariantWithInventorySchema
// >;
// export type VariantBaseType = z.infer<typeof VariantBaseSchema>;
// export type ProductImageType = z.infer<typeof ProductImageSchema>;
// export type VariantWithInventorySchemaType = z.infer<
//   typeof VariantWithInventorySchema
// >;
