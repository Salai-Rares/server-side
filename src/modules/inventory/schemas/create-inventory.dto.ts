import { z } from "zod";


export const CreateInventorySchema = z.object({
  referenceRootId: z.string().min(1, 'Reference ID is required'),
  referenceVariantId: z.string().optional(),
  stock: z.number().positive('Stock cannot be negative'),
  warehouseLocation : z.string().optional()
});

export const CreateMultipleInventoriesSchema = z.array(CreateInventorySchema);

export type CreateInventoryType = z.infer<typeof CreateInventorySchema>;
export type CreateMultipleInventoriesType = z.infer<typeof CreateMultipleInventoriesSchema>;