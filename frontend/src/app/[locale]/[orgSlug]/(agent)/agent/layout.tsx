import type { ReactNode } from "react";

import AppShell from "@/shared/components/AppShell";
import { Role } from "@/types/roleTypes";

export default function AgentLayout({ children }: { children: ReactNode }) {
  return <AppShell role={Role.AGENT}>{children}</AppShell>;
}
