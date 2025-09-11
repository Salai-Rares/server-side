import { PRODUCT_LIMITS } from "@/modules/product/constants/product-validation.constants";
import { boolean, z } from "zod";

export const InventorySchema = z
  .object({
    stock: z.coerce.number().nonnegative().default(0),
    warehouseLocation: z.string().optional(),
  })
  .strip();
const UpdateableInventorySchema = InventorySchema.partial();
export const UpdateInventoryByIDSchema = UpdateableInventorySchema.extend({
  id: z.string(),
}).strip();



export const InventoryOperationSchema = z
  .object({
    create: InventorySchema.optional(),
    update: UpdateInventoryByIDSchema.optional(),
    remove: z.string().optional(), // inventory id
  })
  .refine(
    (data) => {
      const keys = ["create", "update", "remove"].filter(
        (k) => data[k as keyof typeof data] !== undefined
      );
      return keys.length === 1;
    },
    {
      message: "Exactly one of create, update, or remove must be provided.",
    }
  );

export type InventoryCreateType = z.infer<typeof InventorySchema>;
export type UpdateInventoryType = z.infer<typeof UpdateInventoryByIDSchema>;
export type UpdateableInventoryType = z.infer<typeof UpdateableInventorySchema>;

export type InventoryOperationType = z.infer<typeof InventoryOperationSchema>;
