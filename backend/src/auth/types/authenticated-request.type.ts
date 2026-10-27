import type { Membership } from '@prisma/client';
import type { Request } from 'express';
import type { JwtPayload } from './jwt-payload.type';

export type AuthenticatedRequest = Request & {
  user: JwtPayload;
  membership?: Membership;
};
