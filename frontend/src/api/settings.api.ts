import type { PublicUser } from "@/types/api.types";

import { apiClient } from "./api.client";

export type Organization = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
};

export const settingsApi = {
  updateProfile: (data: { name: string }) =>
    apiClient.patch<PublicUser>("/users/me", data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.patch<{ message: string }>("/users/me/password", data),

  getOrganization: (orgId: string) =>
    apiClient.get<Organization>(`/organizations/${orgId}`),

  updateOrganization: (orgId: string, data: { name: string }) =>
    apiClient.patch<Organization>(`/organizations/${orgId}`, data)
};
