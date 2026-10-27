import { z } from "zod";

export const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .email("validation.invalidEmail");
export const newPasswordField = z.string().min(8, "validation.minChars8");
export const nameField = z
  .string()
  .trim()
  .min(2, "validation.minChars2")
  .max(80, "validation.maxChars80");

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "validation.required")
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  orgSlug: z.string().trim().toLowerCase().min(1, "validation.required"),
  name: nameField,
  email: emailField,
  password: newPasswordField
});
export type RegisterValues = z.infer<typeof registerSchema>;

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "validation.minChars3")
  .max(40)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "validation.slugFormat");

export const registerOrganizationSchema = z.object({
  organizationName: nameField,
  slug: slugSchema,
  name: nameField,
  email: emailField,
  password: newPasswordField
});
export type RegisterOrganizationValues = z.infer<
  typeof registerOrganizationSchema
>;

export const forgotPasswordSchema = z.object({ email: emailField });
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: newPasswordField,
    confirmPassword: z.string()
  })
  .refine(values => values.password === values.confirmPassword, {
    message: "validation.passwordsMismatch",
    path: ["confirmPassword"]
  });
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
