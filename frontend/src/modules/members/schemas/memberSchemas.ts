import { z } from "zod";

import { emailField, nameField } from "@/modules/auth/schemas/authSchemas";
import { Role } from "@/types/role.types";

/** No password: new people get an email invitation to choose their own. */
export const addMemberSchema = z.object({
  name: nameField,
  email: emailField,
  role: z.enum(Role)
});
export type AddMemberValues = z.infer<typeof addMemberSchema>;
