import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import type { ApiError } from "@/api/api.client";
import { membersApi } from "@/api/members.api";
import type { Role } from "@/types/role.types";

import { memberKeys } from "../consts/memberKeys";
import type { CreateMemberInput, Member } from "../types/member.types";

export function useMemberMutations(orgId: string) {
  const queryClient = useQueryClient();
  const t = useTranslations("toasts");
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: memberKeys.all(orgId) });
  const onError = (error: ApiError) => toast.error(error.message);

  const create = useMutation<Member, ApiError, CreateMemberInput>({
    mutationFn: data => membersApi.create(orgId, data),
    onSuccess: member => {
      void invalidate();
      toast.success(t("memberAdded", { name: member.user.name }));
    },
    onError
  });

  const updateRole = useMutation<
    Member,
    ApiError,
    { membershipId: string; role: Role }
  >({
    mutationFn: ({ membershipId, role }) =>
      membersApi.updateRole(orgId, membershipId, role),
    onSuccess: () => {
      void invalidate();
      toast.success(t("roleUpdated"));
    },
    onError
  });

  const remove = useMutation<void, ApiError, string>({
    mutationFn: membershipId => membersApi.remove(orgId, membershipId),
    onSuccess: () => {
      void invalidate();
      toast.success(t("memberRemoved"));
    },
    onError
  });

  return { create, updateRole, remove };
}
