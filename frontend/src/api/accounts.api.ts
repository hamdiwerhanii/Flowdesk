import type { Member } from "@/types/memberTypes";
import type { Role } from "@/types/roleTypes";

import { apiClient } from "./api.client";

const base = (orgId: string) => `/organizations/${orgId}/account-requests`;

export const accountsApi = {
  listPending: (orgId: string) => apiClient.get<Member[]>(base(orgId)),

  approve: (orgId: string, membershipId: string, role: Role) =>
    apiClient.patch<Member>(`${base(orgId)}/${membershipId}/approve`, { role }),

  reject: (orgId: string, membershipId: string) =>
    apiClient.patch<Member>(`${base(orgId)}/${membershipId}/reject`)
};
