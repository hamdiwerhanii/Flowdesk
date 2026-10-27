import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role, TicketStatus } from '@prisma/client';
import type { Env } from '../config/env.validation';
import { MailService } from '../mail/mail.service';
import type { TicketMailContext } from '../mail/types/mail.types';
import { ticketLink } from '../mail/utils/app-links.util';
import { PrismaService } from '../prisma/prisma.service';
import type { TicketCommentEntity } from './entities/ticket-comment.entity';
import type { TicketEntity } from './entities/ticket.entity';

@Injectable()
export class TicketNotificationsService {
  private readonly logger = new Logger(TicketNotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  async ticketCreated(ticket: TicketEntity, actorId: string): Promise<void> {
    await this.safely('ticketCreated', async () => {
      this.mail.sendTicketReceived(
        ticket.requester,
        await this.context(ticket, ticket.requesterId),
      );
      if (ticket.assignee && ticket.assignee.id !== actorId) {
        await this.notifyAssignee(ticket, actorId);
      }
    });
  }

  async ticketUpdated(
    before: TicketEntity,
    after: TicketEntity,
    actorId: string,
  ): Promise<void> {
    await this.safely('ticketUpdated', async () => {
      const newAssignee =
        after.assignee && after.assignee.id !== before.assigneeId;
      if (newAssignee && after.assignee!.id !== actorId) {
        await this.notifyAssignee(after, actorId);
      }
      const justResolved =
        after.status === TicketStatus.RESOLVED &&
        before.status !== TicketStatus.RESOLVED;
      if (justResolved && after.requesterId !== actorId) {
        this.mail.sendTicketResolved(
          after.requester,
          await this.context(after, after.requesterId),
        );
      }
    });
  }

  async commentCreated(
    ticket: TicketEntity,
    comment: TicketCommentEntity,
    authorIsStaff: boolean,
  ): Promise<void> {
    if (comment.isInternal) return;
    await this.safely('commentCreated', async () => {
      const recipient = authorIsStaff ? ticket.requester : ticket.assignee;
      if (!recipient || recipient.id === comment.author.id) return;
      this.mail.sendTicketReply(
        recipient,
        await this.context(ticket, recipient.id),
        comment.author.name,
        comment.body,
      );
    });
  }

  private async notifyAssignee(ticket: TicketEntity, actorId: string) {
    const actor = await this.prisma.user.findUnique({
      where: { id: actorId },
      select: { name: true },
    });
    this.mail.sendTicketAssigned(
      ticket.assignee!,
      await this.context(ticket, ticket.assignee!.id),
      actor?.name ?? 'A teammate',
    );
  }

  private async context(
    ticket: TicketEntity,
    recipientId: string,
  ): Promise<TicketMailContext> {
    const [organization, membership] = await Promise.all([
      this.prisma.organization.findUniqueOrThrow({
        where: { id: ticket.organizationId },
        select: { name: true, slug: true },
      }),
      this.prisma.membership.findUnique({
        where: {
          userId_organizationId: {
            userId: recipientId,
            organizationId: ticket.organizationId,
          },
        },
        select: { role: true },
      }),
    ]);
    return {
      number: ticket.number,
      subject: ticket.subject,
      organizationName: organization.name,
      url: ticketLink(
        this.config.get('APP_URL', { infer: true }),
        organization.slug,
        membership?.role ?? Role.CUSTOMER,
        ticket.id,
      ),
    };
  }

  private async safely(label: string, work: () => Promise<void>) {
    try {
      await work();
    } catch (error) {
      this.logger.error(
        `${label} notification failed: ${(error as Error).message}`,
      );
    }
  }
}
