import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { membersApi } from "@/api/members.api";
import type { MemberFilters } from "@/types/memberTypes";
import { Role } from "@/types/roleTypes";

import { memberKeys } from "../consts/memberKeys";

export function useMembers(orgId: string, filters: MemberFilters) {
  return useQuery({
    queryKey: memberKeys.list(orgId, filters),
    queryFn: () => membersApi.list(orgId, filters),
    placeholderData: keepPreviousData,
    enabled: !!orgId
  });
}

export function useStaffMembers(orgId: string, enabled = true) {
  return useQuery({
    queryKey: memberKeys.staff(orgId),
    queryFn: async () => {
      const [agents, admins] = await Promise.all([
        membersApi.list(orgId, { page: 1, role: Role.AGENT, limit: 100 }),
        membersApi.list(orgId, { page: 1, role: Role.ADMIN, limit: 100 })
      ]);
      return [...agents.data, ...admins.data].sort((a, b) =>
        a.user.name.localeCompare(b.user.name)
      );
    },
    enabled: !!orgId && enabled,
    staleTime: 5 * 60_000
  });
}
