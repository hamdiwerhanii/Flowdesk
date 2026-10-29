"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Headset, LogOut } from "lucide-react";
import { useTranslations } from "next-intl";

import { ORG_COOKIE } from "@/lib/routing";
import { useSocketStatus } from "@/lib/SocketProvider";
import { cn } from "@/lib/utils";
import useAuthStore from "@/modules/auth/store/authStore";
import { Link, usePathname, useRouter } from "@/navigation";
import { Select } from "@/shared/components/Input";
import LocaleSwitcher from "@/shared/components/LocaleSwitcher";
import { ActivePill } from "@/shared/components/Motion";
import { activeNavPath, NAV_ITEMS } from "@/shared/constants/navigation";
import { useOrgContext } from "@/shared/hooks/useOrgContext";
import { roleSegment } from "@/shared/utils/role.utils";

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
    <div className='flex h-full flex-col gap-6 p-5'>
      <div className='flex items-center gap-2.5 px-1 pt-1'>
        <span className='grid size-9 place-items-center rounded-xl bg-linear-to-br from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-600/30'>
          <Headset className='size-4.5' aria-hidden />
        </span>
        <span className='text-lg font-bold tracking-tight'>
          {t("common.appName")}
        </span>
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
        <p className='bg-muted text-foreground/80 truncate rounded-xl px-3 py-2 text-sm font-semibold'>
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
                "relative z-0 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                isActive
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:bg-primary-soft hover:text-primary"
              )}
            >
              {isActive && <ActivePill layoutId='sidebar-active' />}
              <Icon className='size-4' aria-hidden />
              {t(`nav.${item.labelKey}`)}
            </Link>
          );
        })}
      </nav>

      <div className='space-y-3 border-t pt-4'>
        <div className='bg-muted/70 flex items-start gap-3 rounded-xl p-3'>
          <span
            className='bg-primary-soft text-primary grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold'
            aria-hidden
          >
            {user.name.slice(0, 1).toUpperCase()}
          </span>
          <div className='min-w-0'>
            <p className='truncate text-sm font-semibold'>{user.name}</p>
            <p className='text-muted-foreground truncate text-xs'>
              {user.email}
            </p>
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
        </div>
        <LocaleSwitcher className='px-3' />
        <button
          type='button'
          onClick={handleLogout}
          className='text-muted-foreground hover:bg-danger-soft hover:text-danger flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors'
        >
          <LogOut className='size-4' aria-hidden />
          {t("common.logout")}
        </button>
      </div>
    </div>
  );
}
