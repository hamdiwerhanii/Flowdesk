import type { DashboardStats } from "@/modules/dashboard/types/dashboard.types";

import { apiClient } from "./api.client";

export const dashboardApi = {
  get: (orgId: string) =>
    apiClient.get<DashboardStats>(`/organizations/${orgId}/dashboard`)
};
