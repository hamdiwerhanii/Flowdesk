import { z } from "zod";

import {
  nameField,
  newPasswordField
} from "@/modules/auth/schemas/authSchemas";

export const profileSchema = z.object({ name: nameField });
export type ProfileValues = z.infer<typeof profileSchema>;

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "validation.required"),
    newPassword: newPasswordField,
    confirmPassword: z.string()
  })
  .refine(values => values.newPassword === values.confirmPassword, {
    message: "validation.passwordsMismatch",
    path: ["confirmPassword"]
  });
export type PasswordValues = z.infer<typeof passwordSchema>;

export const organizationSchema = z.object({ name: nameField });
export type OrganizationValues = z.infer<typeof organizationSchema>;
