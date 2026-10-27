import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Membership,
  MembershipStatus,
  Prisma,
  TicketSource,
} from '@prisma/client';
import { STAFF_ROLES } from '../decorators/role.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { toPaginated } from '../shared/dto/paginated-response.dto';
import { SocketEvent } from '../web-socket/types/events.types';
import { WebsocketGateway } from '../web-socket/web-socket.gateway';
import { CUSTOMER_STATUS_CHANGES, DONE_STATUSES } from './consts/ticket.consts';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { ListTicketsQueryDto } from './dto/list-tickets-query.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketEntity, ticketInclude } from './entities/ticket.entity';
import { TicketNotificationsService } from './ticket-notifications.service';
import { canViewTicket, isStaff } from './utils/ticket-access.util';
import { allocateTicketNumbers } from './utils/ticket-number.util';

type Caller = Pick<Membership, 'userId' | 'role'>;

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: WebsocketGateway,
    private readonly notifications: TicketNotificationsService,
  ) {}

  async list(orgId: string, caller: Caller, query: ListTicketsQueryDto) {
    const where: Prisma.TicketWhereInput = {
      organizationId: orgId,
      status: query.status,
      priority: query.priority,
    };

    if (!isStaff(caller.role)) {
      where.requesterId = caller.userId;
    } else if (query.assignee === 'me') {
      where.assigneeId = caller.userId;
    } else if (query.assignee === 'unassigned') {
      where.assigneeId = null;
    } else if (query.assignee) {
      where.assigneeId = query.assignee;
    }

    const search = query.search?.trim();
    if (search) {
      const number = Number(search.replace(/^#/, ''));
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        ...(Number.isInteger(number) && number > 0 ? [{ number }] : []),
      ];
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.ticket.findMany({
        where,
        include: ticketInclude,
        orderBy: { updatedAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.ticket.count({ where }),
    ]);
    return toPaginated(data, total, query.page, query.limit);
  }

  async findOne(
    orgId: string,
    caller: Caller,
    ticketId: string,
  ): Promise<TicketEntity> {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id: ticketId, organizationId: orgId },
      include: ticketInclude,
    });
    if (!ticket || !canViewTicket(caller, ticket)) {
      throw new NotFoundException('Ticket not found');
    }
    return ticket;
  }

  async create(orgId: string, caller: Caller, dto: CreateTicketDto) {
    const staff = isStaff(caller.role);
    if (!staff && (dto.requesterId || dto.assigneeId)) {
      throw new ForbiddenException(
        'Customers cannot set requester or assignee',
      );
    }
    if (dto.requesterId) await this.assertMember(orgId, dto.requesterId);
    if (dto.assigneeId) await this.assertStaffMember(orgId, dto.assigneeId);

    const ticket = await this.prisma.$transaction(async (tx) => {
      const number = await allocateTicketNumbers(tx, orgId);
      return tx.ticket.create({
        data: {
          organizationId: orgId,
          number,
          subject: dto.subject,
          description: dto.description,
          priority: dto.priority,
          requesterId: dto.requesterId ?? caller.userId,
          assigneeId: dto.assigneeId,
          source: staff ? TicketSource.AGENT : TicketSource.PORTAL,
        },
        include: ticketInclude,
      });
    });

    this.gateway.emitTicketEvent(
      ticket.requesterId,
      SocketEvent.TICKET_CREATED,
      {
        orgId,
        ticketId: ticket.id,
      },
    );
    void this.notifications.ticketCreated(ticket, caller.userId);
    return ticket;
  }

  async update(
    orgId: string,
    caller: Caller,
    ticketId: string,
    dto: UpdateTicketDto,
  ) {
    const ticket = await this.findOne(orgId, caller, ticketId);
    const data: Prisma.TicketUncheckedUpdateInput = isStaff(caller.role)
      ? await this.staffChanges(orgId, dto)
      : this.customerChanges(dto);

    if (dto.status) {
      data.resolvedAt = DONE_STATUSES.includes(dto.status)
        ? (ticket.resolvedAt ?? new Date())
        : null;
    }

    const updated = await this.prisma.ticket.update({
      where: { id: ticketId },
      data,
      include: ticketInclude,
    });
    this.gateway.emitTicketEvent(
      updated.requesterId,
      SocketEvent.TICKET_UPDATED,
      {
        orgId,
        ticketId,
      },
    );
    void this.notifications.ticketUpdated(ticket, updated, caller.userId);
    return updated;
  }

  async remove(orgId: string, caller: Caller, ticketId: string) {
    const ticket = await this.findOne(orgId, caller, ticketId);
    await this.prisma.ticket.delete({ where: { id: ticketId } });
    this.gateway.emitTicketEvent(
      ticket.requesterId,
      SocketEvent.TICKET_DELETED,
      {
        orgId,
        ticketId,
      },
    );
  }

  private async staffChanges(
    orgId: string,
    dto: UpdateTicketDto,
  ): Promise<Prisma.TicketUncheckedUpdateInput> {
    if (dto.assigneeId) await this.assertStaffMember(orgId, dto.assigneeId);
    return {
      subject: dto.subject,
      description: dto.description,
      status: dto.status,
      priority: dto.priority,
      assigneeId: dto.assigneeId,
    };
  }

  private customerChanges(
    dto: UpdateTicketDto,
  ): Prisma.TicketUncheckedUpdateInput {
    const fields = Object.entries(dto)
      .filter(([, value]) => value !== undefined)
      .map(([key]) => key);
    const onlyStatus = fields.length === 1 && fields[0] === 'status';
    if (!onlyStatus || !CUSTOMER_STATUS_CHANGES.includes(dto.status!)) {
      throw new ForbiddenException(
        'Customers can only close or reopen tickets',
      );
    }
    return { status: dto.status };
  }

  private async assertMember(orgId: string, userId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId: orgId } },
    });
    if (membership?.status !== MembershipStatus.ACTIVE) {
      throw new BadRequestException('Requester is not a member');
    }
    return membership;
  }

  private async assertStaffMember(orgId: string, userId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId: orgId } },
    });
    if (
      membership?.status !== MembershipStatus.ACTIVE ||
      !STAFF_ROLES.includes(membership.role)
    ) {
      throw new BadRequestException('Assignee must be an agent or admin');
    }
  }
}
