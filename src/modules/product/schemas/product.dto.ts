import { z } from "zod";
import { Types } from "mongoose";
import { InventorySchema } from "@/modules/inventory/schemas/inventory.dto";
import { isValidObjectId } from "@/shared/utils";

// Helper
const objectIdSchema = z.instanceof(Types.ObjectId);

const PriceSchema = z.object({
  currency: z.string().default("LEU"),
  amount: z.coerce.number().nonnegative(),
}).strip();

const ProductImageSchema = z.object({
  url: z.string(),
  alt: z.string(),
  isPrimary: z.boolean().default(false),
}).strip();

const VariantBaseSchema = z.object({
  sku: z.string().min(1),
  productOptions: z.record(z.string()),
  price: PriceSchema.optional(),
  images: z.array(ProductImageSchema).optional(),
}).strip();

const VariantWithInventorySchema = VariantBaseSchema.extend({ 
  inventory: InventorySchema.optional(),
}).strip();

const RatingSummarySchema = z.object({
  average: z.number().min(0).max(5),
  count: z.number().nonnegative(),
  distribution: z
    .object({
      1: z.coerce.number().min(0),
      2: z.coerce.number().min(0),
      3: z.coerce.number().min(0),
      4: z.coerce.number().min(0),
      5: z.coerce.number().min(0),
    }).strip()
    
}).strip();

const SeoMetaSchema = z.object({
  title: z.string(),
  description: z.string(),
  keywords: z.array(z.string()),
  cannonicalUrl: z.string(),
}).strip();

const AttributeSchema = z.object({
  key: z.string().min(1),
  value: z.array(z.string()).nonempty(),
}).strip();

export const ProductStatusEnum = z.enum([
  "draft",
  "active",
  "archived",
  "deleted",
]);

//need to create a ProductBaseSchema and variant schema that dosen't hold the inventory so we can make some update schema that can update the variant without having to worry about inventory

export const ProductBaseSchema = z.object({
  sku: z.string().min(1),

  name: z.string().min(1),
  description: z.string(),
  shortDescription: z.string().optional(),

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
    .nonempty(),
  tags: z.array(z.string()).optional(),

  images: z.array(ProductImageSchema).nonempty(),
  price: PriceSchema,
  discount: z
    .object({
      type: z.enum(["percentage", "fixed"]),
      value: z.number().positive(),
      validUntil: z.date().optional(),
    })
    .optional(),
  
  variants: z.array(VariantBaseSchema).optional(),
  //used for promotions like banners and so on (in the future when I have multiple record databases maybe change the logic to something like promote last added products)
  isFeatured: z.boolean().optional(),
  status: ProductStatusEnum.default("draft"),

  ratings: RatingSummarySchema,
  reviewsCount: z.number(),
    
  seo: SeoMetaSchema.optional(),
  attributes: z.array(AttributeSchema).optional(),
}).strip();

export const CreateProductDto = ProductBaseSchema.extend({
  variants: z.array(VariantWithInventorySchema).optional(),
  inventory: InventorySchema.optional(),
  ratings: RatingSummarySchema.optional().default({average:0,count:0,distribution:{1:0,2:0,3:0,4:0,5:0}}),
  reviewsCount: z.number().optional().default(0),
})

export const UpdateProductDto = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
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
    .nonempty()
    .optional(),
  tags: z.array(z.string()).optional(),
  images: z.array(ProductImageSchema).optional(),
  price: PriceSchema.optional(),
  discount: z
    .object({
      type: z.enum(["percentage", "fixed"]),
      value: z.number().positive(),
      validUntil: z.date().optional(),
    })
    .optional(),
  variants: z.array(VariantBaseSchema).optional(), // Note: No inventory here
  isFeatured: z.boolean().optional(),
  seo: SeoMetaSchema.optional(),
  attributes: z.array(AttributeSchema).optional(),
  reason: z.string().max(500).optional(), // For audit trail
}).strip();



export const ProductResponseDto = ProductBaseSchema.extend({
  _id: objectIdSchema.transform((id) => id.toString()),
  slug: z.string().min(1),
  createdAt: z.date().transform((d) => d.toISOString()),
  updatedAt: z.date().transform((d) => d.toISOString()),
}).transform(({ _id, ...rest }) => ({
  id: _id,
  ...rest,
}));

export type CreateProductDto = z.infer<typeof CreateProductDto>;
export type UpdateProductDto = z.infer<typeof UpdateProductDto>;
export type ProductResponseDto = z.infer<typeof ProductResponseDto>;
export type ProductStatusType = z.infer<typeof ProductStatusEnum>;
export type VariantWithInventoryType = z.infer<typeof VariantWithInventorySchema>
export type VariantBaseType = z.infer<typeof VariantBaseSchema>