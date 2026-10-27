"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Headset, LogOut } from "lucide-react";
import { useTranslations } from "next-intl";

import { ORG_COOKIE } from "@/lib/routing";
import { useSocketStatus } from "@/lib/SocketProvider";
import { cn } from "@/lib/utils";
import useAuthStore from "@/modules/auth/store/authStore";
import { Link, usePathname, useRouter } from "@/navigation";
import { activeNavPath, NAV_ITEMS } from "@/shared/constants/navigation";
import { useOrgContext } from "@/shared/hooks/useOrgContext";
import { roleSegment } from "@/types/role.types";

import LocaleSwitcher from "../LocaleSwitcher";
import { Select } from "../ui/input";

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations();
  const { orgSlug, role, user } = useOrgContext();
  const logout = useAuthStore(s => s.logout);
  const { connected } = useSocketStatus();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const router = useRouter();

  const items = NAV_ITEMS[role];
  const active = activeNavPath(pathname, orgSlug, items);

  const switchOrganization = (slug: string) => {
    const membership = user.memberships.find(m => m.organization.slug === slug);
    if (!membership) return;
    document.cookie = `${ORG_COOKIE}=${slug}; path=/; max-age=31536000; samesite=lax`;
    router.push(`/${slug}/${roleSegment(membership.role)}`);
  };

  const handleLogout = async () => {
    await logout();
    queryClient.clear();
    router.replace("/login");
  };

  return (
    <div className='flex h-full flex-col gap-6 p-4'>
      <div className='flex items-center gap-2 px-2 pt-1'>
        <span className='bg-primary text-primary-foreground grid size-8 place-items-center rounded-lg'>
          <Headset className='size-4' aria-hidden />
        </span>
        <span className='text-lg font-semibold'>{t("common.appName")}</span>
      </div>

      {user.memberships.length > 1 ? (
        <Select
          aria-label={t("common.organization")}
          value={orgSlug}
          onChange={event => switchOrganization(event.target.value)}
        >
          {user.memberships.map(m => (
            <option key={m.id} value={m.organization.slug}>
              {m.organization.name}
            </option>
          ))}
        </Select>
      ) : (
        <p className='text-muted-foreground truncate px-2 text-sm font-medium'>
          {user.memberships[0]?.organization.name}
        </p>
      )}

      <nav
        aria-label={t("common.mainNavigation")}
        className='flex flex-1 flex-col gap-1'
      >
        {items.map(item => {
          const Icon = item.icon;
          const isActive = item.path === active;
          return (
            <Link
              key={item.path}
              href={`/${orgSlug}/${item.path}`}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary-soft text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className='size-4' aria-hidden />
              {t(`nav.${item.labelKey}`)}
            </Link>
          );
        })}
      </nav>

      <div className='space-y-3 border-t pt-4'>
        <div className='px-2'>
          <p className='truncate text-sm font-medium'>{user.name}</p>
          <p className='text-muted-foreground truncate text-xs'>{user.email}</p>
          <p className='text-muted-foreground mt-1 flex items-center gap-1.5 text-xs'>
            <span
              className={cn(
                "size-2 rounded-full",
                connected ? "bg-emerald-500" : "bg-zinc-400"
              )}
              aria-hidden
            />
            {t(`roles.${role}`)} ·{" "}
            {t(connected ? "common.live" : "common.offline")}
          </p>
        </div>
        <LocaleSwitcher className='px-3' />
        <button
          type='button'
          onClick={handleLogout}
          className='text-muted-foreground hover:bg-muted hover:text-foreground flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium'
        >
          <LogOut className='size-4' aria-hidden />
          {t("common.logout")}
        </button>
      </div>
    </div>
  );
}
