export const Role = {
  ADMIN: "ADMIN",
  AGENT: "AGENT",
  CUSTOMER: "CUSTOMER"
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const STAFF_ROLES: Role[] = [Role.ADMIN, Role.AGENT];
export const isStaffRole = (role: Role | undefined): boolean =>
  !!role && STAFF_ROLES.includes(role);

/** URL segment of each role's area: /[orgSlug]/admin, /agent, /customer. */
export const roleSegment = (role: Role): string => role.toLowerCase();
