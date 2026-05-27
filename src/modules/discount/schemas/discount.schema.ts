import { z } from "zod";

// --- Individual condition schemas ---
const ProductConditionSchema = z.object({
  type: z.literal("product"),
  operator: z.enum(["equals", "in"]),
  value: z.union([z.string(), z.array(z.string())]),
});
const VariantConditionSchema = z.object({
  type: z.literal("variant"),
  operator: z.enum(["equals", "in"]),
  value: z.union([z.string(), z.array(z.string())]),
});
const CategoryConditionSchema = z.object({
  type: z.literal("category"),
  operator: z.enum(["equals", "in"]),
  value: z.union([z.string(), z.array(z.string())]),
});

const TagConditionSchema = z.object({
  type: z.literal("tag"),
  operator: z.enum(["equals", "in"]),
  value: z.union([z.string(), z.array(z.string())]),
});

const CartTotalConditionSchema = z.object({
  type: z.literal("cart_total"),
  operator: z.enum(["greater_than", "less_than"]),
  value: z.number(),
});

const QuantityConditionSchema = z.object({
  type: z.literal("quantity"),
  operator: z.enum(["equals", "greater_than", "less_than"]),
  value: z.number(),
});

const UserSegmentConditionSchema = z.object({
  type: z.literal("user_segment"),
  operator: z.enum(["equals", "in"]),
  value: z.union([z.string(), z.array(z.string())]),
});

// --- Union of all condition schemas ---
export const ConditionZodSchema = z.union([
  ProductConditionSchema,
  VariantConditionSchema,
  CategoryConditionSchema,
  TagConditionSchema,
  CartTotalConditionSchema,
  QuantityConditionSchema,
  UserSegmentConditionSchema,
]);

// --- Shared fields for all discount types ---
const DiscountBaseSchema = z.object({
  name: z.string().min(5).optional(),
  description: z.string().min(10).optional(),
  startDate: z.preprocess(
    (val) => (val ? new Date(val as string) : undefined),
    z.date()
  ),
  endDate: z.preprocess(
    (val) => (val ? new Date(val as string) : undefined),
    z.date()
  ),
  usageLimit: z.coerce.number().min(1).optional(),
  usageCount: z.coerce.number().min(0).default(0),
  active: z.boolean().default(false),
  conditions: z.array(ConditionZodSchema).optional(),
  priority: z.coerce.number().min(0).max(3),
});

const BuyXGetYValueSchema = z.object({
  buyQuantity: z.number().int().min(1),
  getQuantity: z.number().int().min(1),
  getDiscount: z.number().min(0).max(100).default(100),
});

// --- Discount schema ---
export const DiscountZodSchema = z.discriminatedUnion("type", [
  DiscountBaseSchema.extend({
    type: z.literal("percentage"),
    value: z.coerce.number().min(0).max(100),
  }),
  DiscountBaseSchema.extend({
    type: z.literal("fixed_amount"),
    value: z.coerce.number().min(0),
  }),
  DiscountBaseSchema.extend({
    type: z.literal("buy_x_get_y"),
    value: BuyXGetYValueSchema,
  }),
]);

// --- Types ---
export type DiscountConditionType = z.infer<typeof ConditionZodSchema>;
export type DiscountZodType = z.infer<typeof DiscountZodSchema>;
