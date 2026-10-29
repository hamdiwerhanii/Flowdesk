import type { Role } from "@/types/roleTypes";

export type MembershipSummary = {
  id: string;
  role: Role;
  organization: { id: string; name: string; slug: string };
};

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  memberships: MembershipSummary[];
};

export type AuthStatus =
  "idle" | "loading" | "authenticated" | "unauthenticated";
