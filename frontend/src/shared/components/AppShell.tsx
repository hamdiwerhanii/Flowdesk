"use client";

import { Lock, Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ReactNode, useState } from "react";

import { Link } from "@/navigation";
import { Button } from "@/shared/components/Button";
import EmptyState from "@/shared/components/EmptyState";
import { PageTransition } from "@/shared/components/Motion";
import Sidebar from "@/shared/components/SideBar";
import { useOrgContext } from "@/shared/hooks/useOrgContext";
import { roleSegment } from "@/shared/utils/role.utils";
import { type Role } from "@/types/roleTypes";

type AppShellProps = {
  role: Role;
  children: ReactNode;
};

export default function AppShell({ role, children }: AppShellProps) {
  const t = useTranslations();
  const { role: myRole, orgSlug } = useOrgContext();
  const [menuOpen, setMenuOpen] = useState(false);

  if (myRole !== role) {
    return (
      <div className='flex min-h-screen items-center justify-center p-6'>
        <EmptyState
          icon={Lock}
          title={t("shell.wrongAreaTitle")}
          action={
            <Button asChild>
              <Link href={`/${orgSlug}/${roleSegment(myRole)}`}>
                {t("shell.goToWorkspace")}
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className='min-h-screen lg:pl-72'>
      <aside className='bg-card/80 fixed inset-y-0 left-0 hidden w-72 border-r backdrop-blur-xl lg:block'>
        <Sidebar />
      </aside>

      <header className='bg-card/90 sticky top-0 z-30 flex items-center gap-3 border-b px-4 py-3 backdrop-blur lg:hidden'>
        <Button
          variant='ghost'
          size='icon'
          aria-label={t("common.openMenu")}
          onClick={() => setMenuOpen(true)}
        >
          <Menu />
        </Button>
        <span className='font-semibold'>{t("common.appName")}</span>
      </header>

      {menuOpen && (
        <div className='fixed inset-0 z-40 lg:hidden'>
          <button
            type='button'
            aria-label={t("common.closeMenu")}
            className='absolute inset-0 bg-slate-900/30 backdrop-blur-sm'
            onClick={() => setMenuOpen(false)}
          />
          <aside className='bg-card relative h-full w-72 max-w-[85%] shadow-xl'>
            <Button
              variant='ghost'
              size='icon'
              aria-label={t("common.closeMenu")}
              className='absolute top-3 right-3'
              onClick={() => setMenuOpen(false)}
            >
              <X />
            </Button>
            <Sidebar onNavigate={() => setMenuOpen(false)} />
          </aside>
        </div>
      )}

      <main className='mx-auto max-w-6xl px-4 py-6 sm:px-8 lg:py-10'>
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}
