import { ConfigService } from '@nestjs/config';
import { Role, TicketStatus } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import type { TicketCommentEntity } from './entities/ticket-comment.entity';
import type { TicketEntity } from './entities/ticket.entity';
import { TicketNotificationsService } from './ticket-notifications.service';

const customer = { id: 'customer-1', name: 'Karim', email: 'karim@test' };
const agent = { id: 'agent-1', name: 'Sami', email: 'sami@test' };
const otherAgent = { id: 'agent-2', name: 'Lina', email: 'lina@test' };

const ticket = (overrides: Partial<TicketEntity> = {}) =>
  ({
    id: 'ticket-1',
    number: 7,
    subject: 'Login broken',
    organizationId: 'org-1',
    status: TicketStatus.OPEN,
    requesterId: customer.id,
    requester: customer,
    assigneeId: agent.id,
    assignee: agent,
    ...overrides,
  }) as TicketEntity;

const comment = (author: typeof customer, isInternal = false) =>
  ({ id: 'c1', body: 'Hello', isInternal, author }) as TicketCommentEntity;

describe('TicketNotificationsService', () => {
  let mail: Record<string, jest.Mock>;
  let service: TicketNotificationsService;

  beforeEach(() => {
    mail = {
      sendTicketReceived: jest.fn(),
      sendTicketAssigned: jest.fn(),
      sendTicketReply: jest.fn(),
      sendTicketResolved: jest.fn(),
    };
    const prisma = {
      organization: {
        findUniqueOrThrow: jest
          .fn()
          .mockResolvedValue({ name: 'Acme', slug: 'acme' }),
      },
      membership: {
        findUnique: jest.fn().mockResolvedValue({ role: Role.AGENT }),
      },
      user: { findUnique: jest.fn().mockResolvedValue({ name: 'Amira' }) },
    };
    const config = { get: () => 'http://app.test' } as unknown as ConfigService;
    service = new TicketNotificationsService(
      prisma as unknown as PrismaService,
      mail as unknown as MailService,
      config as never,
    );
  });

  it('confirms a new ticket to the requester and alerts the assignee', async () => {
    await service.ticketCreated(ticket(), customer.id);
    expect(mail.sendTicketReceived).toHaveBeenCalledWith(
      customer,
      expect.objectContaining({
        number: 7,
        url: 'http://app.test/acme/agent/tickets/ticket-1',
      }),
    );
    expect(mail.sendTicketAssigned).toHaveBeenCalledWith(
      agent,
      expect.anything(),
      'Amira',
    );
  });

  it('does not email agents who assign a ticket to themselves', async () => {
    const before = ticket({ assigneeId: null, assignee: null });
    await service.ticketUpdated(before, ticket(), agent.id);
    expect(mail.sendTicketAssigned).not.toHaveBeenCalled();
  });

  it('emails the new assignee when someone else reassigns', async () => {
    const after = ticket({ assigneeId: otherAgent.id, assignee: otherAgent });
    await service.ticketUpdated(ticket(), after, agent.id);
    expect(mail.sendTicketAssigned).toHaveBeenCalledWith(
      otherAgent,
      expect.anything(),
      'Amira',
    );
  });

  it('tells the requester when their ticket is resolved', async () => {
    const after = ticket({ status: TicketStatus.RESOLVED });
    await service.ticketUpdated(ticket(), after, agent.id);
    expect(mail.sendTicketResolved).toHaveBeenCalledWith(
      customer,
      expect.anything(),
    );
  });

  it('sends staff replies to the requester and customer replies to the assignee', async () => {
    await service.commentCreated(ticket(), comment(agent), true);
    expect(mail.sendTicketReply).toHaveBeenLastCalledWith(
      customer,
      expect.anything(),
      'Sami',
      'Hello',
    );
    await service.commentCreated(ticket(), comment(customer), false);
    expect(mail.sendTicketReply).toHaveBeenLastCalledWith(
      agent,
      expect.anything(),
      'Karim',
      'Hello',
    );
  });

  it('never emails internal notes', async () => {
    await service.commentCreated(ticket(), comment(agent, true), true);
    expect(mail.sendTicketReply).not.toHaveBeenCalled();
  });

  it('does not email customer replies on unassigned tickets', async () => {
    await service.commentCreated(
      ticket({ assigneeId: null, assignee: null }),
      comment(customer),
      false,
    );
    expect(mail.sendTicketReply).not.toHaveBeenCalled();
  });
});
