// src/services/dtos/product.dto.ts
import { z } from 'zod';

/**
 * Zod schema for creating a product.
 * 
 * - `title`: string, required
 * - `description`: string, optional
 * - `price`: number, required, min 0
 * - `attributes`: array of objects with `key` (string) and `value` (string[])
 * - etc.
 */
export const createProductZodSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be >= 0"),
  rating: z.number().min(0).max(5).optional(),
  attributes: z
    .array(
      z.object({
        key: z.string().min(1),
        value: z.array(z.string()),
      })
    )
    .optional(),
  // Add more fields as needed, e.g., categories, quantity, etc.
});

/**
 * This is the TypeScript type inferred from the Zod schema.
 * We can use it as the DTO interface.
 */
export type CreateProductDTO = z.infer<typeof createProductZodSchema>;

/**
 * Example: A separate schema for updating a product.
 * Some fields might be optional, others required, etc.
 */
export const updateProductZodSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  rating: z.number().min(0).max(5).optional(),
  attributes: z
    .array(
      z.object({
        key: z.string(),
        value: z.array(z.string()),
      })
    )
    .optional(),
});

export type UpdateProductDTO = z.infer<typeof updateProductZodSchema>;