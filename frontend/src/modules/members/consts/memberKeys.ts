import type { MemberFilters } from "@/types/memberTypes";

export const memberKeys = {
  all: (orgId: string) => ["members", orgId] as const,
  list: (orgId: string, filters: MemberFilters) =>
    [...memberKeys.all(orgId), "list", filters] as const,
  staff: (orgId: string) => [...memberKeys.all(orgId), "staff"] as const
};
