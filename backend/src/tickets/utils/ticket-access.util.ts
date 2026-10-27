import type { Membership, Role } from '@prisma/client';
import { STAFF_ROLES } from '../../decorators/role.decorator';

export const isStaff = (role: Role): boolean => STAFF_ROLES.includes(role);

export const canViewTicket = (
  membership: Pick<Membership, 'userId' | 'role'>,
  ticket: { requesterId: string },
): boolean =>
  isStaff(membership.role) || ticket.requesterId === membership.userId;
