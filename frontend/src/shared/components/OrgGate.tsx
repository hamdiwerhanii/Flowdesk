"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ShieldOff } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import useAuthStore from "@/modules/auth/store/authStore";
import { useRouter } from "@/navigation";
import { Button } from "@/shared/components/Button";
import EmptyState from "@/shared/components/EmptyState";
import { useCurrentMembership } from "@/shared/hooks/useOrgContext";
import { useRealtimeSync } from "@/shared/hooks/useRealtimeSync";
import { isStaffRole } from "@/shared/utils/role.utils";

export default function OrgGate({ children }: { children: ReactNode }) {
  const t = useTranslations();
  const membership = useCurrentMembership();
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const queryClient = useQueryClient();
  const router = useRouter();

  useRealtimeSync(
    membership?.organization.id ?? "",
    user?.id ?? "",
    isStaffRole(membership?.role)
  );

  if (!membership) {
    return (
      <div className='flex min-h-screen items-center justify-center p-6'>
        <EmptyState
          icon={ShieldOff}
          title={t("shell.noAccessTitle")}
          description={t("shell.noAccessBody")}
          action={
            <Button
              variant='outline'
              onClick={async () => {
                await logout();
                queryClient.clear();
                router.replace("/login");
              }}
            >
              {t("common.logout")}
            </Button>
          }
        />
      </div>
    );
  }
  return children;
}
