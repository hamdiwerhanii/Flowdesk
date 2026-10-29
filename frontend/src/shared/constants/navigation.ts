import {
  Building2,
  FileUp,
  LayoutDashboard,
  type LucideIcon,
  PlusCircle,
  Ticket,
  UserCheck,
  UserCircle,
  Users
} from "lucide-react";

import type { Role } from "@/types/roleTypes";

export type NavItem = {
  path: string;
  labelKey: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: Record<Role, NavItem[]> = {
  ADMIN: [
    { path: "admin", labelKey: "dashboard", icon: LayoutDashboard },
    { path: "admin/tickets", labelKey: "tickets", icon: Ticket },
    { path: "admin/tickets/new", labelKey: "newTicket", icon: PlusCircle },
    { path: "admin/members", labelKey: "members", icon: Users },
    {
      path: "admin/account-management",
      labelKey: "accountRequests",
      icon: UserCheck
    },
    { path: "admin/imports", labelKey: "imports", icon: FileUp },
    {
      path: "admin/settings/organization",
      labelKey: "organization",
      icon: Building2
    },
    { path: "admin/settings/profile", labelKey: "profile", icon: UserCircle }
  ],
  AGENT: [
    { path: "agent", labelKey: "dashboard", icon: LayoutDashboard },
    { path: "agent/tickets", labelKey: "tickets", icon: Ticket },
    { path: "agent/tickets/new", labelKey: "newTicket", icon: PlusCircle },
    { path: "agent/settings/profile", labelKey: "profile", icon: UserCircle }
  ],
  CUSTOMER: [
    { path: "customer/tickets", labelKey: "tickets", icon: Ticket },
    { path: "customer/tickets/new", labelKey: "newTicket", icon: PlusCircle }
  ]
};

export function activeNavPath(
  pathname: string,
  orgSlug: string,
  items: NavItem[]
): string | undefined {
  return items
    .map(item => item.path)
    .filter(path => {
      const href = `/${orgSlug}/${path}`;
      return pathname === href || pathname.startsWith(`${href}/`);
    })
    .sort((a, b) => b.length - a.length)[0];
}
