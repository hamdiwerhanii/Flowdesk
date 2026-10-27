import type { ReactNode } from "react";

import AppShell from "@/shared/components/layout/AppShell";
import { Role } from "@/types/role.types";

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return <AppShell role={Role.CUSTOMER}>{children}</AppShell>;
}
