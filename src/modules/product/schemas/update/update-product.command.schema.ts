import { InventorySchema } from "@/modules/inventory/schemas/inventory.dto";

import { VariantBaseSchema, ProductImageSchema } from "../shared.schema";
import { z } from "zod";
import { VariantUpdateSchema } from "./update-product.schema";

export const ProductImageCommandSchema = ProductImageSchema.extend({
    tempId:z.string()
})

export const VariantCreateCommandSchema = VariantBaseSchema.extend({
  inventory: InventorySchema.optional(),
  images: z.array(ProductImageCommandSchema).optional(),
});
export const ImageOperationsCommandSchema = z
  .object({
    add: z.array(ProductImageCommandSchema).optional(),
    remove: z.array(z.string()).optional(), // publicIds to delete
    order: z.array(z.string()).optional(), // tempIds + publicIds in final order
  })
  .strip();

export const VariantUpdateCommandSchema = VariantUpdateSchema.extend({
  images: ImageOperationsCommandSchema.optional(),
}).strip();


export const VariantOperationsCommandSchema = z.object(
    {
        add : z.array(VariantCreateCommandSchema).optional(),
        update: z.array(VariantUpdateCommandSchema).optional(),
        remove:z.array(z.string()).min(1).optional()
    }
).strip()


export type VariantCreateCommandType = z.infer<
  typeof VariantCreateCommandSchema
>;
export type ImageOperationCommandType = z.infer<
  typeof ImageOperationsCommandSchema
>;
export type VariantUpdateCommandType = z.infer<
  typeof VariantUpdateCommandSchema
>;

export type VariantOperationsCommandType = z.infer<typeof VariantOperationsCommandSchema>
export type ProductImageCommandType = z.infer<typeof ProductImageCommandSchema>