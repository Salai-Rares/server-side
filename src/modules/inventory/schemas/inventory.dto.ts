import {z} from "zod"

export const InventorySchema = z.object({
    stock: z.coerce.number().nonnegative().default(0),
    inStock: z.boolean().default(false),
    warehouseLocation: z.string().optional(),
  }).superRefine((data, ctx) => {
    if (data.stock > 0 && !data.inStock) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "inStock should be true when stock is greater than 0",
        path: ["inStock"],
      });
    }
  
    if (data.stock === 0 && data.inStock) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "inStock should be false when stock is zero",
        path: ["inStock"],
      });
    }
  });

  export type InventoryDto = z.infer<typeof InventorySchema>;