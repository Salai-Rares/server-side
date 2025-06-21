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

const updatableKeysSchema = UpdateableInventorySchema.extend({
  inStock: z.boolean(),
});

export const InventoryOperationSchema = z
  .object({
    create: InventorySchema.optional(),
    update: UpdateInventoryByIDSchema.optional(),
    delete: z.string().optional(), // inventory id
  })
  .refine((data) => {
    const keys = ["create", "update", "delete"].filter(
      (k) => data[k as keyof typeof data] !== undefined
    );
    return keys.length === 1;
  }, {
    message: "Exactly one of create, update, or delete must be provided.",
  });


export type InventoryDto = z.infer<typeof InventorySchema>;
export type UpdateInventoryType = z.infer<typeof UpdateInventoryByIDSchema>;
export type UpdateableInventoryType = z.infer<typeof UpdateableInventorySchema>;
export type UpdateableInventoryFieldsTypes = keyof z.infer<
  typeof updatableKeysSchema
>;
export type InventoryOperationType = z.infer<typeof InventoryOperationSchema>
