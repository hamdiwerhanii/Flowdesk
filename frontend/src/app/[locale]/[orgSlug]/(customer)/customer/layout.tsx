import type { ReactNode } from "react";

import AppShell from "@/shared/components/AppShell";
import { Role } from "@/types/roleTypes";

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return <AppShell role={Role.CUSTOMER}>{children}</AppShell>;
}
