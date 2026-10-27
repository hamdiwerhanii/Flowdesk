import type { Membership } from '@prisma/client';
import type { Request } from 'express';
import type { JwtPayload } from './jwt-payload.type';

export type AuthenticatedRequest = Request & {
  user: JwtPayload;
  /** Set by RoleGuard on routes with an `:orgId` param. */
  membership?: Membership;
};
