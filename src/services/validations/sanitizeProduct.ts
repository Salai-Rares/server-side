import { z } from "zod";
import { CreateProductDTO, createProductZodSchema } from "../dtos/product.dto";

/**
 * Attempts to sanitize and validate the incoming product data.
 * - Converts certain fields from string to number (e.g., price, rating).
 * - Then parses and validates the result with Zod.
 *
 * @param body - The raw request body to sanitize.
 * @returns The validated and typed CreateProductDTO object.
 * @throws {z.ZodError} If validation fails.
 */
export function sanitizeCreateProductDto(body: any): CreateProductDTO {
  // 1. Transform (sanitize) any fields that may come in as strings
  //    but should be numbers. (Adjust as needed.)
  const sanitizedBody = {
    ...body,
    price: body.price != null ? parseFloat(body.price) : undefined,
    rating: body.rating != null ? parseFloat(body.rating) : undefined,
  };

  // 2. Parse/validate with Zod. If invalid, Zod throws a ZodError.
  return createProductZodSchema.parse(sanitizedBody);
}