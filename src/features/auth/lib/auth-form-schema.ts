import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long.")
  .regex(/[^A-Za-z0-9]/, "Password must include at least 1 symbol.");

export const loginFormSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: passwordSchema,
});

export const signUpFormSchema = loginFormSchema.extend({
  displayName: z
    .string()
    .trim()
    .min(2, "Display name must be at least 2 characters long.")
    .max(50, "Display name must be 50 characters or less."),
});

export type LoginFormSchema = z.infer<typeof loginFormSchema>;
export type SignUpFormSchema = z.infer<typeof signUpFormSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid email address."),
});

export const updatePasswordSchema = z.object({
  password: passwordSchema,
});

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type UpdatePasswordSchema = z.infer<typeof updatePasswordSchema>;
