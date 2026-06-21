import { z } from "zod";

export const CouponZodSchema = z.object({
  code: z.string().min(3).transform((v) => v.toUpperCase()),
  discountId: z.string(),
  usageLimit: z.coerce.number().min(1).optional(),
  active: z.boolean().default(true),
  expiresAt: z.preprocess(
    (val) => (val ? new Date(val as string) : undefined),
    z.date().optional()
  ),
});

export type CouponZodType = z.infer<typeof CouponZodSchema>;
