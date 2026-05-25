import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export type LoginHttpDto = z.infer<typeof LoginSchema>;
