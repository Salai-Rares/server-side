import { z } from "zod";
import { Types } from "mongoose";
// Base schema for common validation
export const CategoryBaseSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters")
    .trim(),
  path: z
    .string()
    .min(2, "Path must be at least 2 characters")
    .max(100, "Path cannot exceed 100 characters")
    .regex(
      /^[a-z0-9-]+(\/[a-z0-9-]+)*$/,
      "Path must be lowercase with optional slashes"
    ),
  image: z
    .string()
    .nullish() // Accepts undefined/null
    .transform((val) => val ?? null), // Converts to null if undefined
});

// Response DTO (extends base + adds DB fields)
export const CategoryResponseDto = CategoryBaseSchema.extend({
  _id: z.instanceof(Types.ObjectId).transform((id) => id.toString()),
  createdAt: z.date().transform((d) => d.toISOString()),
  updatedAt: z.date().transform((d) => d.toISOString()),
}).transform(({ _id, ...rest }) => ({
  id: _id, // Rename _id to id
  ...rest,
}));

//Create DTO
export const CreateCategoryDto = CategoryBaseSchema.superRefine((data, ctx) => {
  if (data.path.includes("/") && data.image) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Subcategories should not have images",
    });
  } else if (!data.path.includes("/") && !data.image) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Root categories must have an image",
    });
  }
});

// Update DTO
export const UpdateCategoryDto = CategoryBaseSchema.partial().refine(
  (data) => Object.keys(data).length >= 1,
  {
    message: "At least one field must be provided for update",
  }
);

// Infer the TypeScript type from the Zod schema
export type CreateCategoryDto = z.infer<typeof CreateCategoryDto>;
export type UpdateCategoryDto = z.infer<typeof UpdateCategoryDto>;
export type CategoryResponseDto = z.infer<typeof CategoryResponseDto>;
export type CategoryBaseSchemaDto = z.infer<typeof CategoryBaseSchema>
