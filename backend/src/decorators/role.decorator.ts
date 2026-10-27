import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLE_KEY = 'roles';
/**
 * Restricts a route to these organization roles. On routes with an
 * `:orgId` param the role must be held in THAT organization.
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLE_KEY, roles);

/** Roles that work tickets (as opposed to customers who open them). */
export const STAFF_ROLES: Role[] = [Role.ADMIN, Role.AGENT];
