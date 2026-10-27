import type { Role } from '@prisma/client';

/** One active membership, embedded in the access token for routing. */
export type JwtRole = {
  orgId: string;
  orgSlug: string;
  orgName: string;
  role: Role;
};

export type JwtPayload = {
  sub: string;
  email: string;
  name: string;
  roles: JwtRole[];
};
