import type { ImportBatch, ImportBatchDetail } from "@/types/importTypes";

import { apiClient } from "./api.client";

const base = (orgId: string) => `/organizations/${orgId}/imports`;

export const importsApi = {
  list: (orgId: string) => apiClient.get<ImportBatch[]>(base(orgId)),

  get: (orgId: string, batchId: string) =>
    apiClient.get<ImportBatchDetail>(`${base(orgId)}/${batchId}`),

  upload: (orgId: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return apiClient.post<ImportBatch>(base(orgId), form);
  },

  commit: (orgId: string, batchId: string) =>
    apiClient.post<ImportBatchDetail>(`${base(orgId)}/${batchId}/commit`),

  revert: (orgId: string, batchId: string) =>
    apiClient.post<ImportBatchDetail>(`${base(orgId)}/${batchId}/revert`)
};
