import { z } from "zod";

export const loginFormSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long."),
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
