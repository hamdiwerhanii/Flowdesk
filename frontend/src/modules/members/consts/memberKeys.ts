import type { MemberFilters } from "../types/member.types";

export const memberKeys = {
  all: (orgId: string) => ["members", orgId] as const,
  list: (orgId: string, filters: MemberFilters) =>
    [...memberKeys.all(orgId), "list", filters] as const,
  /** Agents and admins, for assignee pickers. */
  staff: (orgId: string) => [...memberKeys.all(orgId), "staff"] as const
};
