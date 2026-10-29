import type { ReactNode } from "react";

import AuthGate from "@/lib/authGate";
import OrgGate from "@/shared/components/OrgGate";

export default function OrgLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      <OrgGate>{children}</OrgGate>
    </AuthGate>
  );
}
