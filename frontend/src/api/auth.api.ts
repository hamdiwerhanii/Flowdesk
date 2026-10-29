import type {
  LoginValues,
  RegisterOrganizationValues,
  RegisterValues
} from "@/modules/auth/schemas/authSchemas";
import type { AuthUser } from "@/types/authTypes";

import { apiClient } from "./api.client";

export const authApi = {
  login: (data: LoginValues) =>
    apiClient.post<AuthUser>("/auth/login", data, { skipAuth: true }),

  register: (data: RegisterValues) =>
    apiClient.post<{ message: string }>("/auth/register", data, {
      skipAuth: true
    }),

  registerOrganization: (data: RegisterOrganizationValues) =>
    apiClient.post<AuthUser>("/auth/register-organization", data, {
      skipAuth: true
    }),

  forgotPassword: (data: { email: string }) =>
    apiClient.post<{ message: string }>("/auth/forgot-password", data, {
      skipAuth: true
    }),

  resetPassword: (data: { token: string; password: string }) =>
    apiClient.post<{ message: string }>("/auth/reset-password", data, {
      skipAuth: true
    }),

  me: () => apiClient.get<AuthUser>("/auth/me"),

  logout: () =>
    apiClient.post<void>("/auth/logout", undefined, { skipAuth: true })
};
