import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MembershipStatus, Role } from '@prisma/client';
import { IS_PUBLIC_KEY } from '../../decorators/public.decorator';
import { ROLE_KEY } from '../../decorators/role.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { RoleGuard } from './role.guard';

const contextFor = (request: object): ExecutionContext =>
  ({
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => request }),
  }) as unknown as ExecutionContext;

describe('RoleGuard', () => {
  let metadata: Record<string, unknown>;
  let findUnique: jest.Mock;
  let guard: RoleGuard;

  beforeEach(() => {
    metadata = {};
    findUnique = jest.fn();
    const reflector = {
      getAllAndOverride: (key: string) => metadata[key],
    } as unknown as Reflector;
    const prisma = { membership: { findUnique } } as unknown as PrismaService;
    guard = new RoleGuard(reflector, prisma);
  });

  const user = { sub: 'user-1', roles: [] };

  it('lets public routes through without a user', async () => {
    metadata[IS_PUBLIC_KEY] = true;
    await expect(guard.canActivate(contextFor({}))).resolves.toBe(true);
  });

  it('rejects callers who are not active members of :orgId', async () => {
    findUnique.mockResolvedValue({
      status: MembershipStatus.PENDING,
      role: Role.ADMIN,
    });
    const request = { user, params: { orgId: 'org-1' } };
    await expect(guard.canActivate(contextFor(request))).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('enforces @Roles against the membership of that organization', async () => {
    metadata[ROLE_KEY] = [Role.ADMIN];
    findUnique.mockResolvedValue({
      status: MembershipStatus.ACTIVE,
      role: Role.AGENT,
    });
    const request = { user, params: { orgId: 'org-1' } };
    await expect(guard.canActivate(contextFor(request))).rejects.toThrow(
      'Missing required role',
    );
  });

  it('attaches the membership for the service layer', async () => {
    const membership = { status: MembershipStatus.ACTIVE, role: Role.CUSTOMER };
    findUnique.mockResolvedValue(membership);
    const request: Record<string, unknown> = {
      user,
      params: { orgId: 'org-1' },
    };
    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(request.membership).toBe(membership);
    expect(findUnique).toHaveBeenCalledWith({
      where: {
        userId_organizationId: { userId: 'user-1', organizationId: 'org-1' },
      },
    });
  });
});
