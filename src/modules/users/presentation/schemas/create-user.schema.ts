import { USER_LIMITS } from "@/modules/users/domain/constants/user-constraints.constants";
import { z } from "zod";

/**
 * DTO for creating a new user
 * Used for input validation at application boundary
 */
export const CreateUserSchema = z.object({
  firstName: z
    .string()
    .min(USER_LIMITS.FIRSTNAME.MIN_LENGTH)
    .max(USER_LIMITS.FIRSTNAME.MAX_LENGTH)
    .trim(),
  lastName: z
    .string()
    .min(USER_LIMITS.LASTNAME.MIN_LENGTH)
    .max(USER_LIMITS.LASTNAME.MAX_LENGTH)
    .trim(),
  email: z.string().email().toLowerCase().trim(),
  password: z
    .string()
    .min(USER_LIMITS.PASSWORD.MIN_LENGTH)
    .max(USER_LIMITS.PASSWORD.MAX_LENGTH),
  confirmPassword: z.string(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "You must accept terms and conditions" }),
  }),
  termsVersion:z.string().min(1),
  newsletter: z.boolean().optional(),
  marketingConsent: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type CreateUserHttpDto = z.infer<typeof CreateUserSchema>;
