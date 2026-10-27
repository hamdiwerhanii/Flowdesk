import { Injectable, NotFoundException } from '@nestjs/common';
import { MembershipStatus, Role } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { memberSelect } from '../members/entities/member.entity';
import { PrismaService } from '../prisma/prisma.service';
import { SocketEvent } from '../web-socket/types/events.types';
import { WebsocketGateway } from '../web-socket/web-socket.gateway';
import { ApproveAccountDto } from './dto/approve-account.dto';

@Injectable()
export class AccountManagementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: WebsocketGateway,
    private readonly mail: MailService,
  ) {}

  listPending(orgId: string) {
    return this.prisma.membership.findMany({
      where: { organizationId: orgId, status: MembershipStatus.PENDING },
      select: memberSelect,
      orderBy: { createdAt: 'asc' },
    });
  }

  async approve(orgId: string, membershipId: string, dto: ApproveAccountDto) {
    await this.findPending(orgId, membershipId);
    const approved = await this.setStatus(
      orgId,
      membershipId,
      MembershipStatus.ACTIVE,
      { role: dto.role ?? Role.CUSTOMER },
    );
    const organization = await this.prisma.organization.findUniqueOrThrow({
      where: { id: orgId },
      select: { name: true },
    });
    this.mail.sendAccountApproved(approved.user, organization.name);
    return approved;
  }

  async reject(orgId: string, membershipId: string) {
    await this.findPending(orgId, membershipId);
    return this.setStatus(orgId, membershipId, MembershipStatus.REJECTED);
  }

  private async findPending(orgId: string, membershipId: string) {
    const membership = await this.prisma.membership.findFirst({
      where: {
        id: membershipId,
        organizationId: orgId,
        status: MembershipStatus.PENDING,
      },
    });
    if (!membership) throw new NotFoundException('Pending request not found');
    return membership;
  }

  private async setStatus(
    orgId: string,
    membershipId: string,
    status: MembershipStatus,
    extra: { role?: Role } = {},
  ) {
    const updated = await this.prisma.membership.update({
      where: { id: membershipId },
      data: { status, ...extra },
      select: memberSelect,
    });
    const payload = { orgId, userId: updated.user.id };
    this.gateway.emitToOrgAdmins(
      orgId,
      SocketEvent.MEMBERSHIP_CHANGED,
      payload,
    );
    return updated;
  }
}
