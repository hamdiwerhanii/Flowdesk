import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MembershipStatus, Role } from '@prisma/client';
import { IS_PUBLIC_KEY } from '../../decorators/public.decorator';
import { ROLE_KEY } from '../../decorators/role.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthenticatedRequest } from '../types/authenticated-request.type';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets)) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<Role[] | undefined>(
      ROLE_KEY,
      targets,
    );
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const orgId = request.params?.orgId as string | undefined;

    if (!orgId) {
      if (!requiredRoles) return true;
      const hasRole = request.user.roles.some((r) =>
        requiredRoles.includes(r.role),
      );
      if (!hasRole) throw new ForbiddenException('Missing required role');
      return true;
    }

    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId: request.user.sub,
          organizationId: orgId,
        },
      },
    });
    if (!membership || membership.status !== MembershipStatus.ACTIVE) {
      throw new ForbiddenException('You are not a member of this organization');
    }
    if (requiredRoles && !requiredRoles.includes(membership.role)) {
      throw new ForbiddenException('Missing required role');
    }

    request.membership = membership;
    return true;
  }
}
