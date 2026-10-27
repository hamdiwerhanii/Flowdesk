import type { Role } from '@prisma/client';

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
