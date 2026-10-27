import { useParams } from "next/navigation";

import useAuthStore from "@/modules/auth/store/authStore";
import type { MembershipSummary } from "@/modules/auth/types/auth.types";
import { isStaffRole, type Role } from "@/types/role.types";

/** The membership matching the `[orgSlug]` segment, or undefined. */
export function useCurrentMembership(): MembershipSummary | undefined {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const user = useAuthStore(s => s.user);
  return user?.memberships.find(m => m.organization.slug === orgSlug);
}

/**
 * Organization context for pages under `[orgSlug]`. OrgGate only renders
 * those pages when the membership exists, so the fields are always set there.
 */
export function useOrgContext() {
  const membership = useCurrentMembership();
  const user = useAuthStore(s => s.user)!;
  const role = membership?.role as Role;
  return {
    orgId: membership?.organization.id ?? "",
    orgSlug: membership?.organization.slug ?? "",
    orgName: membership?.organization.name ?? "",
    role,
    isStaff: isStaffRole(role),
    user
  };
}
