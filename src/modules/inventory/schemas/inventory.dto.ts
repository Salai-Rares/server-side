import { boolean, z } from "zod";

export const InventorySchema = z
  .object({
    stock: z.coerce.number().nonnegative().default(0),
    warehouseLocation: z.string().optional(),
  })
  .strip();
export const UpdateableInventorySchema = InventorySchema.partial();
export const UpdateInventoryByIDSchema = UpdateableInventorySchema.extend({
  id: z.string(),
}).strip();

const updatableKeysSchema = UpdateableInventorySchema.extend({
  inStock: z.boolean(),
});

export type InventoryDto = z.infer<typeof InventorySchema>;
export type UpdateInventoryType = z.infer<typeof UpdateInventoryByIDSchema>;
export type UpdateableInventoryType = z.infer<typeof UpdateableInventorySchema>;
export type UpdateableInventoryFieldsTypes = keyof z.infer<
  typeof updatableKeysSchema
>;
