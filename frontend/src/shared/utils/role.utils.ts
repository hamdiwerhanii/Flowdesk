import { Role } from "@/types/roleTypes";

export const STAFF_ROLES: Role[] = [Role.ADMIN, Role.AGENT];

export const isStaffRole = (role: Role | undefined): boolean =>
  !!role && STAFF_ROLES.includes(role);

export const roleSegment = (role: Role): string => role.toLowerCase();
