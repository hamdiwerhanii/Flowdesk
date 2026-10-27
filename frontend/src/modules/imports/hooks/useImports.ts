import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import type { ApiError } from "@/api/api.client";
import { importsApi } from "@/api/imports.api";
import { dashboardKeys } from "@/modules/dashboard/consts/dashboardKeys";
import { ticketKeys } from "@/modules/tickets/consts/ticketKeys";

import { importKeys } from "../consts/importKeys";
import type { ImportBatch, ImportBatchDetail } from "../types/import.types";

export function useImportBatches(orgId: string) {
  return useQuery({
    queryKey: importKeys.list(orgId),
    queryFn: () => importsApi.list(orgId),
    enabled: !!orgId
  });
}

export function useImportBatch(orgId: string, batchId: string) {
  return useQuery({
    queryKey: importKeys.detail(orgId, batchId),
    queryFn: () => importsApi.get(orgId, batchId),
    enabled: !!orgId && !!batchId
  });
}

export function useImportMutations(orgId: string) {
  const queryClient = useQueryClient();
  const t = useTranslations("toasts");
  const onError = (error: ApiError) => toast.error(error.message);

  const afterBatchChange = (batch: ImportBatchDetail) => {
    queryClient.setQueryData(importKeys.detail(orgId, batch.id), batch);
    void queryClient.invalidateQueries({ queryKey: importKeys.list(orgId) });
    void queryClient.invalidateQueries({ queryKey: ticketKeys.all(orgId) });
    void queryClient.invalidateQueries({ queryKey: dashboardKeys.all(orgId) });
  };

  const upload = useMutation<ImportBatch, ApiError, File>({
    mutationFn: file => importsApi.upload(orgId, file),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: importKeys.list(orgId) }),
    onError
  });

  const commit = useMutation<ImportBatchDetail, ApiError, string>({
    mutationFn: batchId => importsApi.commit(orgId, batchId),
    onSuccess: batch => {
      afterBatchChange(batch);
      toast.success(t("importDone", { count: batch._count.tickets }));
    },
    onError
  });

  const revert = useMutation<ImportBatchDetail, ApiError, string>({
    mutationFn: batchId => importsApi.revert(orgId, batchId),
    onSuccess: batch => {
      afterBatchChange(batch);
      toast.success(t("importReverted"));
    },
    onError
  });

  return { upload, commit, revert };
}
