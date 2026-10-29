import { decodeJwt } from "jose";

import { roleSegment } from "@/shared/utils/role.utils";
import { type Role } from "@/types/roleTypes";

export type SessionRole = {
  orgId: string;
  orgSlug: string;
  orgName: string;
  role: Role;
};

export type Session = {
  sub: string;
  email: string;
  name: string;
  roles: SessionRole[];
  exp?: number;
};

export const ORG_COOKIE = "flowdesk_org";

const ROLE_SEGMENTS = ["admin", "agent", "customer"];
const CLOCK_SKEW_SECONDS = 10;

export function decodeSession(token: string | undefined): Session | null {
  if (!token) return null;
  try {
    const payload = decodeJwt(token) as Session;
    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp <= now + CLOCK_SKEW_SECONDS) return null;
    if (!Array.isArray(payload.roles)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function parseOrgRolePath(
  path: string
): { orgSlug: string; segment: string } | null {
  const [orgSlug, segment] = path.split("/").filter(Boolean);
  if (!orgSlug || !segment || !ROLE_SEGMENTS.includes(segment)) return null;
  return { orgSlug, segment };
}

export function pickDefaultRole(
  roles: SessionRole[],
  savedOrgSlug?: string
): SessionRole {
  const saved = roles.find(r => r.orgSlug === savedOrgSlug);
  if (saved) return saved;
  return [...roles].sort((a, b) => a.orgName.localeCompare(b.orgName))[0];
}

export const homePath = (locale: string, role: SessionRole): string =>
  `/${locale}/${role.orgSlug}/${roleSegment(role.role)}`;
