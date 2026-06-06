import { z } from "zod";
import { Types } from "mongoose";
import { isValidObjectId } from "@/shared/utils";
import { PRODUCT_LIMITS } from "../constants/product-validation.constants";
import { normalizeName } from "@/shared/utils/string-format.utils";

// ===============================
// CORE BUILDING BLOCKS
// ===============================

export const objectIdSchema = z.instanceof(Types.ObjectId);

export const PriceSchema = z
  .object({
    currency: z.string().default(PRODUCT_LIMITS.CURRENCY.DEFAULT),
    amount: z.coerce
      .number()
      .min(PRODUCT_LIMITS.PRICE.MIN_AMOUNT)
      .max(PRODUCT_LIMITS.PRICE.MAX_AMOUNT),
  })
  .strip();

export const ProductImageSchema = z
  .object({
    url: z.string().max(PRODUCT_LIMITS.IMAGES.URL_MAX_LENGTH),
    alt: z.string().max(PRODUCT_LIMITS.IMAGES.ALT_MAX_LENGTH),
  })
  .strip();

export const RatingSummarySchema = z
  .object({
    average: z
      .number()
      .min(PRODUCT_LIMITS.RATINGS.MIN_AVERAGE)
      .max(PRODUCT_LIMITS.RATINGS.MAX_AVERAGE),
    count: z.number().min(PRODUCT_LIMITS.RATINGS.MIN_COUNT),
    distribution: z
      .object({
        1: z.coerce.number().min(PRODUCT_LIMITS.RATINGS.DEFAULT),
        2: z.coerce.number().min(PRODUCT_LIMITS.RATINGS.DEFAULT),
        3: z.coerce.number().min(PRODUCT_LIMITS.RATINGS.DEFAULT),
        4: z.coerce.number().min(PRODUCT_LIMITS.RATINGS.DEFAULT),
        5: z.coerce.number().min(PRODUCT_LIMITS.RATINGS.DEFAULT),
      })
      .strip(),
  })
  .strip();

export const SeoMetaSchema = z
  .object({
    title: z
      .string()
      .min(PRODUCT_LIMITS.SEO.TITLE_MIN_LENGTH)
      .max(PRODUCT_LIMITS.SEO.TITLE_MAX_LENGTH),
    description: z
      .string()
      .min(PRODUCT_LIMITS.SEO.DESCRIPTION_MIN_LENGTH)
      .max(PRODUCT_LIMITS.SEO.DESCRIPTION_MAX_LENGTH),
    keywords: z
      .array(z.string().max(PRODUCT_LIMITS.SEO.KEYWORD_MAX_LENGTH))
      .max(PRODUCT_LIMITS.SEO.KEYWORDS_MAX_COUNT),
    cannonicalUrl: z
      .string()
      .url()
      .max(PRODUCT_LIMITS.SEO.CANONICAL_URL_MAX_LENGTH),
  })
  .strip();

export const AttributeSchema = z
  .object({
    key: z.string().min(1).max(PRODUCT_LIMITS.ATTRIBUTES.KEY_MAX_LENGTH),
    value: z
      .array(z.string().max(PRODUCT_LIMITS.ATTRIBUTES.VALUE_MAX_LENGTH))
      .nonempty()
      .max(PRODUCT_LIMITS.ATTRIBUTES.VALUES_MAX_COUNT),
  })
  .strip();

export const ProductStatusEnum = z.enum(PRODUCT_LIMITS.STATUS.POSSIBLE_VALUES);

// ===============================
// VARIANT SCHEMAS
// ===============================

export const VariantDraftSchema = z
  .object({
    name: z
      .string()
      .min(PRODUCT_LIMITS.NAME.MIN_LENGTH)
      .max(PRODUCT_LIMITS.NAME.MAX_LENGTH),
    sku: z
      .string()
      .min(PRODUCT_LIMITS.SKU.MIN_LENGTH)
      .max(PRODUCT_LIMITS.SKU.MAX_LENGTH),
    productOptions: z.record(z.string()).optional(),
    price: PriceSchema.optional(),
    costPrice: PriceSchema.optional(),
    vatRate: z.coerce
      .number()
      .pipe(z.union([z.literal(5), z.literal(9), z.literal(21)]))
      .optional(),

    images: z
      .array(ProductImageSchema)
      .max(PRODUCT_LIMITS.IMAGES.MAX_COUNT)
      .optional(),
  })
  .strip();

// ===============================
// PRODUCT CORE FIELDS
// ===============================

export const ProductDraftSchema = z.object({
  name: z
    .string()
    .min(PRODUCT_LIMITS.NAME.MIN_LENGTH)
    .max(PRODUCT_LIMITS.NAME.MAX_LENGTH)
    .transform((val) => normalizeName(val)),
  sku: z
    .string()
    .min(PRODUCT_LIMITS.SKU.MIN_LENGTH)
    .max(PRODUCT_LIMITS.SKU.MAX_LENGTH).transform((val)=>val.toLocaleUpperCase('ro-RO')),
  description: z
    .string()
    .min(PRODUCT_LIMITS.DESCRIPTION.MIN_LENGTH)
    .max(PRODUCT_LIMITS.DESCRIPTION.MAX_LENGTH)
    .optional(),
  shortDescription: z
    .string()
    .max(PRODUCT_LIMITS.SHORT_DESCRIPTION.MAX_LENGTH)
    .optional(),
  brand: z
    .string()
    .refine(isValidObjectId, {
      message: "Invalid MongoDB ID format",
    })
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
    .optional(),
  images: z
    .array(ProductImageSchema)
    .min(PRODUCT_LIMITS.IMAGES.MIN_COUNT)
    .max(PRODUCT_LIMITS.IMAGES.MAX_COUNT)
    .optional(),
  price: PriceSchema.optional(),
  costPrice: PriceSchema.optional(),
  vatRate: z.coerce
    .number()
    .pipe(z.union([z.literal(5), z.literal(9), z.literal(21)]))
    .optional(),
  isFeatured: z.boolean().optional(),
  seo: SeoMetaSchema.optional(),
  attributes: z.array(AttributeSchema).optional(),
  productOptions: z.record(z.string()).optional(),
});

// ===============================
// EXPORTED TYPES
// ===============================

export type PriceType = z.infer<typeof PriceSchema>;
export type ProductImageType = z.infer<typeof ProductImageSchema>;
export type RatingSummaryType = z.infer<typeof RatingSummarySchema>;
export type SeoMetaType = z.infer<typeof SeoMetaSchema>;
export type AttributeType = z.infer<typeof AttributeSchema>;
export type ProductStatusType = z.infer<typeof ProductStatusEnum>;
export type VariantBaseType = z.infer<typeof VariantDraftSchema>;
export type ProductCoreType = z.infer<typeof ProductDraftSchema>;
