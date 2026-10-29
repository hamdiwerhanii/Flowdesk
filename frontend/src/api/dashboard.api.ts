import type { DashboardStats } from "@/types/dashboardTypes";

import { apiClient } from "./api.client";

export const dashboardApi = {
  get: (orgId: string) =>
    apiClient.get<DashboardStats>(`/organizations/${orgId}/dashboard`)
};
