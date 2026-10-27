import { ForbiddenException, Injectable } from '@nestjs/common';
import { Membership, TicketStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SocketEvent } from '../web-socket/types/events.types';
import { WebsocketGateway } from '../web-socket/web-socket.gateway';
import { REOPEN_ON_CUSTOMER_REPLY } from './consts/ticket.consts';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ticketCommentInclude } from './entities/ticket-comment.entity';
import { TicketNotificationsService } from './ticket-notifications.service';
import { TicketsService } from './tickets.service';
import { isStaff } from './utils/ticket-access.util';

type Caller = Pick<Membership, 'userId' | 'role'>;

@Injectable()
export class TicketCommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ticketsService: TicketsService,
    private readonly gateway: WebsocketGateway,
    private readonly notifications: TicketNotificationsService,
  ) {}

  async list(orgId: string, caller: Caller, ticketId: string) {
    await this.ticketsService.findOne(orgId, caller, ticketId);
    return this.prisma.ticketComment.findMany({
      where: {
        ticketId,
        // Customers never receive internal notes.
        ...(isStaff(caller.role) ? {} : { isInternal: false }),
      },
      include: ticketCommentInclude,
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(
    orgId: string,
    caller: Caller,
    ticketId: string,
    dto: CreateCommentDto,
  ) {
    const ticket = await this.ticketsService.findOne(orgId, caller, ticketId);
    const staff = isStaff(caller.role);
    if (dto.isInternal && !staff) {
      throw new ForbiddenException('Only staff can write internal notes');
    }

    const reopen = !staff && REOPEN_ON_CUSTOMER_REPLY.includes(ticket.status);
    const [comment] = await this.prisma.$transaction([
      this.prisma.ticketComment.create({
        data: {
          ticketId,
          authorId: caller.userId,
          body: dto.body,
          isInternal: dto.isInternal ?? false,
        },
        include: ticketCommentInclude,
      }),
      // Bumps updatedAt so the ticket rises in the list; reopens on reply.
      this.prisma.ticket.update({
        where: { id: ticketId },
        data: reopen
          ? { status: TicketStatus.OPEN, resolvedAt: null }
          : { updatedAt: new Date() },
      }),
    ]);

    this.gateway.emitTicketEvent(
      ticket.requesterId,
      SocketEvent.COMMENT_CREATED,
      {
        orgId,
        ticketId,
        commentId: comment.id,
        isInternal: comment.isInternal,
      },
      comment.isInternal,
    );
    if (reopen) {
      this.gateway.emitTicketEvent(
        ticket.requesterId,
        SocketEvent.TICKET_UPDATED,
        {
          orgId,
          ticketId,
        },
      );
    }
    void this.notifications.commentCreated(ticket, comment, staff);
    return comment;
  }
}
