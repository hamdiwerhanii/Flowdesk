import { decodeJwt } from "jose";

import { type Role, roleSegment } from "@/types/role.types";

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

/** Cookie remembering the last organization the user opened. */
export const ORG_COOKIE = "flowdesk_org";

const ROLE_SEGMENTS = ["admin", "agent", "customer"];
const CLOCK_SKEW_SECONDS = 10;

/**
 * Reads the access token WITHOUT verifying its signature. That is safe here
 * because it only decides which page to show: the backend verifies the token
 * on every API call. It also means the frontend never needs the JWT secret.
 */
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

/** `/acme/agent/tickets` → `{ orgSlug: "acme", segment: "agent" }`. */
export function parseOrgRolePath(
  path: string
): { orgSlug: string; segment: string } | null {
  const [orgSlug, segment] = path.split("/").filter(Boolean);
  if (!orgSlug || !segment || !ROLE_SEGMENTS.includes(segment)) return null;
  return { orgSlug, segment };
}

/** The last-used organization if still valid, else the first by name. */
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
