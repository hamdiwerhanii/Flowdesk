import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { accountsApi } from "@/api/accounts.api";
import type { ApiError } from "@/api/api.client";
import { memberKeys } from "@/modules/members/consts/memberKeys";
import type { Member } from "@/modules/members/types/member.types";
import type { Role } from "@/types/role.types";

import { accountKeys } from "../consts/accountKeys";

export function usePendingAccounts(orgId: string) {
  return useQuery({
    queryKey: accountKeys.pending(orgId),
    queryFn: () => accountsApi.listPending(orgId),
    enabled: !!orgId
  });
}

export function useAccountDecisions(orgId: string) {
  const queryClient = useQueryClient();
  const t = useTranslations("toasts");
  const refresh = () => {
    void queryClient.invalidateQueries({
      queryKey: accountKeys.pending(orgId)
    });
    void queryClient.invalidateQueries({ queryKey: memberKeys.all(orgId) });
  };
  const onError = (error: ApiError) => toast.error(error.message);

  const approve = useMutation<
    Member,
    ApiError,
    { membershipId: string; role: Role }
  >({
    mutationFn: ({ membershipId, role }) =>
      accountsApi.approve(orgId, membershipId, role),
    onSuccess: member => {
      refresh();
      toast.success(t("accountApproved", { name: member.user.name }));
    },
    onError
  });

  const reject = useMutation<Member, ApiError, string>({
    mutationFn: membershipId => accountsApi.reject(orgId, membershipId),
    onSuccess: () => {
      refresh();
      toast.success(t("requestRejected"));
    },
    onError
  });

  return { approve, reject };
}
