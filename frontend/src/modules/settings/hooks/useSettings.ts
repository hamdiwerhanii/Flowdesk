import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import type { ApiError } from "@/api/api.client";
import { type Organization, settingsApi } from "@/api/settings.api";
import useAuthStore from "@/modules/auth/store/authStore";

const organizationKey = (orgId: string) => ["organization", orgId] as const;
const onError = (error: ApiError) => toast.error(error.message);

export function useUpdateProfile() {
  const refreshUser = useAuthStore(s => s.refreshUser);
  const t = useTranslations("toasts");
  return useMutation({
    mutationFn: settingsApi.updateProfile,
    onSuccess: () => {
      void refreshUser();
      toast.success(t("profileUpdated"));
    },
    onError
  });
}

export function useChangePassword() {
  return useMutation({ mutationFn: settingsApi.changePassword, onError });
}

export function useOrganization(orgId: string) {
  return useQuery({
    queryKey: organizationKey(orgId),
    queryFn: () => settingsApi.getOrganization(orgId),
    enabled: !!orgId
  });
}

export function useUpdateOrganization(orgId: string) {
  const queryClient = useQueryClient();
  const refreshUser = useAuthStore(s => s.refreshUser);
  const t = useTranslations("toasts");
  return useMutation<Organization, ApiError, { name: string }>({
    mutationFn: data => settingsApi.updateOrganization(orgId, data),
    onSuccess: organization => {
      queryClient.setQueryData(organizationKey(orgId), organization);
      void refreshUser();
      toast.success(t("orgUpdated"));
    },
    onError
  });
}
