"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ShieldOff } from "lucide-react";
import { useTranslations } from "next-intl";

import useAuthStore from "@/modules/auth/store/authStore";
import { useRouter } from "@/navigation";
import { Button } from "@/shared/components/Button";
import EmptyState from "@/shared/components/EmptyState";

export default function NoOrgAccessPage() {
  const t = useTranslations();
  const logout = useAuthStore(s => s.logout);
  const queryClient = useQueryClient();
  const router = useRouter();

  return (
    <main className='flex min-h-screen items-center justify-center p-6'>
      <EmptyState
        icon={ShieldOff}
        title={t("noOrgAccess.title")}
        description={t("noOrgAccess.body")}
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
    </main>
  );
}
