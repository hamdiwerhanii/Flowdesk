import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MembershipStatus,
  PasswordTokenPurpose,
  Prisma,
  Role,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { BCRYPT_ROUNDS } from '../auth/consts/auth.consts';
import { PasswordTokenService } from '../auth/password-token.service';
import type { Env } from '../config/env.validation';
import { MailService } from '../mail/mail.service';
import { passwordLink } from '../mail/utils/app-links.util';
import { PrismaService } from '../prisma/prisma.service';
import { toPaginated } from '../shared/dto/paginated-response.dto';
import { generateSecret } from '../shared/utils/opaque-token.util';
import { SocketEvent } from '../web-socket/types/events.types';
import { WebsocketGateway } from '../web-socket/web-socket.gateway';
import { CreateMemberDto } from './dto/create-member.dto';
import { ListMembersQueryDto } from './dto/list-members-query.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { memberSelect } from './entities/member.entity';

@Injectable()
export class MembersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: WebsocketGateway,
    private readonly mail: MailService,
    private readonly passwordTokens: PasswordTokenService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  async list(orgId: string, query: ListMembersQueryDto) {
    const where: Prisma.MembershipWhereInput = {
      organizationId: orgId,
      status: MembershipStatus.ACTIVE,
      role: query.role,
      user: query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : undefined,
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.membership.findMany({
        where,
        select: memberSelect,
        orderBy: { user: { name: 'asc' } },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.membership.count({ where }),
    ]);
    return toPaginated(data, total, query.page, query.limit);
  }

  async create(orgId: string, dto: CreateMemberDto) {
    const [existingUser, organization] = await Promise.all([
      this.prisma.user.findUnique({
        where: { email: dto.email },
        include: { memberships: { where: { organizationId: orgId } } },
      }),
      this.prisma.organization.findUniqueOrThrow({ where: { id: orgId } }),
    ]);

    const current = existingUser?.memberships[0];
    if (current?.status === MembershipStatus.ACTIVE) {
      throw new ConflictException('This user is already a member');
    }

    const user =
      existingUser ??
      (await this.prisma.user.create({
        data: {
          email: dto.email,
          name: dto.name,
          passwordHash: await bcrypt.hash(generateSecret(), BCRYPT_ROUNDS),
        },
      }));

    const member = current
      ? await this.prisma.membership.update({
          where: { id: current.id },
          data: { role: dto.role, status: MembershipStatus.ACTIVE },
          select: memberSelect,
        })
      : await this.prisma.membership.create({
          data: {
            userId: user.id,
            organizationId: orgId,
            role: dto.role,
            status: MembershipStatus.ACTIVE,
          },
          select: memberSelect,
        });
    this.notify(orgId, user.id);

    if (existingUser) {
      this.mail.sendAddedToOrganization(user, organization.name);
    } else {
      const token = await this.passwordTokens.issue(
        user.id,
        PasswordTokenPurpose.INVITE,
      );
      this.mail.sendInvitation(
        user,
        passwordLink(this.config.get('APP_URL', { infer: true }), token, true),
        organization.name,
        this.passwordTokens.ttlMinutes(PasswordTokenPurpose.INVITE) / 60,
      );
    }
    return member;
  }

  async updateRole(
    orgId: string,
    membershipId: string,
    actorUserId: string,
    dto: UpdateMemberDto,
  ) {
    const membership = await this.findActive(orgId, membershipId);
    if (membership.userId === actorUserId) {
      throw new BadRequestException('You cannot change your own role');
    }
    if (membership.role === Role.ADMIN && dto.role !== Role.ADMIN) {
      await this.assertNotLastAdmin(orgId);
    }
    const updated = await this.prisma.membership.update({
      where: { id: membershipId },
      data: { role: dto.role },
      select: memberSelect,
    });
    this.notify(orgId, membership.userId);
    return updated;
  }

  async remove(orgId: string, membershipId: string, actorUserId: string) {
    const membership = await this.findActive(orgId, membershipId);
    if (membership.userId === actorUserId) {
      throw new BadRequestException('You cannot remove yourself');
    }
    if (membership.role === Role.ADMIN) await this.assertNotLastAdmin(orgId);

    await this.prisma.membership.delete({ where: { id: membershipId } });
    this.notify(orgId, membership.userId);
  }

  private async findActive(orgId: string, membershipId: string) {
    const membership = await this.prisma.membership.findFirst({
      where: {
        id: membershipId,
        organizationId: orgId,
        status: MembershipStatus.ACTIVE,
      },
    });
    if (!membership) throw new NotFoundException('Member not found');
    return membership;
  }

  private async assertNotLastAdmin(orgId: string) {
    const admins = await this.prisma.membership.count({
      where: {
        organizationId: orgId,
        role: Role.ADMIN,
        status: MembershipStatus.ACTIVE,
      },
    });
    if (admins <= 1) {
      throw new BadRequestException('An organization needs at least one admin');
    }
  }

  private notify(orgId: string, userId: string) {
    const payload = { orgId, userId };
    this.gateway.emitToUser(userId, SocketEvent.MEMBERSHIP_CHANGED, payload);
    this.gateway.emitToOrgAdmins(
      orgId,
      SocketEvent.MEMBERSHIP_CHANGED,
      payload,
    );
  }
}
