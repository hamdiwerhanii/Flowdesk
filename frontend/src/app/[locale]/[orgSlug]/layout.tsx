import type { ReactNode } from "react";

import AuthGate from "@/lib/authGate";
import OrgGate from "@/shared/components/layout/OrgGate";

/** Every organization page: signed in, active member, live socket. */
export default function OrgLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      <OrgGate>{children}</OrgGate>
    </AuthGate>
  );
}
