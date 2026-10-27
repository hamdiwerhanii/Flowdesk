import { useQuery } from "@tanstack/react-query";

import { dashboardApi } from "@/api/dashboard.api";

import { dashboardKeys } from "../consts/dashboardKeys";

export function useDashboard(orgId: string) {
  return useQuery({
    queryKey: dashboardKeys.all(orgId),
    queryFn: () => dashboardApi.get(orgId),
    enabled: !!orgId
  });
}
