import { z } from "zod";

export const ResetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token is required"),
    password: z.string().min(1, "Password is required"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;
