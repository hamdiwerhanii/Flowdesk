import type { Membership, Role } from '@prisma/client';
import { STAFF_ROLES } from '../../decorators/role.decorator';

export const isStaff = (role: Role): boolean => STAFF_ROLES.includes(role);

/** Staff see every ticket of their organization; customers only their own. */
export const canViewTicket = (
  membership: Pick<Membership, 'userId' | 'role'>,
  ticket: { requesterId: string },
): boolean =>
  isStaff(membership.role) || ticket.requesterId === membership.userId;
