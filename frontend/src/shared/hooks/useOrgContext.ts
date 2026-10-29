import { useParams } from "next/navigation";

import useAuthStore from "@/modules/auth/store/authStore";
import { isStaffRole } from "@/shared/utils/role.utils";
import type { MembershipSummary } from "@/types/authTypes";
import { type Role } from "@/types/roleTypes";

export function useCurrentMembership(): MembershipSummary | undefined {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const user = useAuthStore(s => s.user);
  return user?.memberships.find(m => m.organization.slug === orgSlug);
}

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
