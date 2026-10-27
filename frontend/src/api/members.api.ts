import type {
  CreateMemberInput,
  Member,
  MemberFilters
} from "@/modules/members/types/member.types";
import type { Paginated } from "@/types/api.types";
import type { Role } from "@/types/role.types";

import { apiClient, toQueryString } from "./api.client";

const base = (orgId: string) => `/organizations/${orgId}/members`;

export const membersApi = {
  list: (orgId: string, filters: MemberFilters & { limit?: number }) =>
    apiClient.get<Paginated<Member>>(
      `${base(orgId)}${toQueryString({ limit: 20, ...filters })}`
    ),

  create: (orgId: string, data: CreateMemberInput) =>
    apiClient.post<Member>(base(orgId), data),

  updateRole: (orgId: string, membershipId: string, role: Role) =>
    apiClient.patch<Member>(`${base(orgId)}/${membershipId}`, { role }),

  remove: (orgId: string, membershipId: string) =>
    apiClient.delete<void>(`${base(orgId)}/${membershipId}`)
};
