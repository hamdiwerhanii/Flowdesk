"use client";

import { Lock, Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ReactNode, useState } from "react";

import { Link } from "@/navigation";
import { useOrgContext } from "@/shared/hooks/useOrgContext";
import { type Role, roleSegment } from "@/types/role.types";

import EmptyState from "../EmptyState";
import { Button } from "../ui/button";
import Sidebar from "./Sidebar";

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
    <div className='min-h-screen lg:pl-64'>
      <aside className='bg-card fixed inset-y-0 left-0 hidden w-64 border-r lg:block'>
        <Sidebar />
      </aside>

      <header className='bg-card sticky top-0 z-30 flex items-center gap-3 border-b px-4 py-3 lg:hidden'>
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
            className='absolute inset-0 bg-black/40'
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

      <main className='mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-10'>
        {children}
      </main>
    </div>
  );
}
