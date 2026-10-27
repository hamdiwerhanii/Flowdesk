import type { ReactNode } from "react";

import AppShell from "@/shared/components/layout/AppShell";
import { Role } from "@/types/role.types";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AppShell role={Role.ADMIN}>{children}</AppShell>;
}
