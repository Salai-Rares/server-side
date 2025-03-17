import {z} from 'zod';

export const filterQueryObjectSchema = z.object({
    filters:z.array(z.record(z.string(),z.array(z.string()))).optional(),
    priceRange:z.object({min:z.number().positive(),max:z.number().positive()}).optional(),
    category:z.string().optional()
})

export type FilterQueryObjectDTO = z.infer<typeof filterQueryObjectSchema>

