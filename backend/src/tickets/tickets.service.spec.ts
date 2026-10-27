import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Role, TicketStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WebsocketGateway } from '../web-socket/web-socket.gateway';
import { TicketNotificationsService } from './ticket-notifications.service';
import { TicketsService } from './tickets.service';

const customer = { userId: 'customer-1', role: Role.CUSTOMER };
const otherCustomer = { userId: 'customer-2', role: Role.CUSTOMER };
const agent = { userId: 'agent-1', role: Role.AGENT };

const ticket = {
  id: 'ticket-1',
  organizationId: 'org-1',
  requesterId: 'customer-1',
  status: TicketStatus.RESOLVED,
  resolvedAt: new Date('2026-01-01'),
};

describe('TicketsService access rules', () => {
  let prisma: { ticket: Record<string, jest.Mock>; $transaction: jest.Mock };
  let gateway: { emitTicketEvent: jest.Mock };
  let service: TicketsService;

  beforeEach(() => {
    prisma = {
      ticket: {
        findFirst: jest.fn().mockResolvedValue(ticket),
        update: jest
          .fn()
          .mockImplementation(({ data }) => ({ ...ticket, ...data })),
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
      $transaction: jest.fn((queries: Promise<unknown>[]) =>
        Promise.all(queries),
      ),
    };
    gateway = { emitTicketEvent: jest.fn() };
    const notifications = {
      ticketCreated: jest.fn().mockResolvedValue(undefined),
      ticketUpdated: jest.fn().mockResolvedValue(undefined),
    };
    service = new TicketsService(
      prisma as unknown as PrismaService,
      gateway as unknown as WebsocketGateway,
      notifications as unknown as TicketNotificationsService,
    );
  });

  it("hides other customers' tickets behind a 404", async () => {
    await expect(
      service.findOne('org-1', otherCustomer, 'ticket-1'),
    ).rejects.toThrow(NotFoundException);
  });

  it('scopes the customer list to their own tickets', async () => {
    await service.list('org-1', customer, {
      page: 1,
      limit: 20,
      assignee: 'me',
    });
    const where = prisma.ticket.findMany.mock.calls[0][0].where;
    expect(where.requesterId).toBe('customer-1');
    expect(where.assigneeId).toBeUndefined();
  });

  it('lets a customer reopen their resolved ticket and clears resolvedAt', async () => {
    await service.update('org-1', customer, 'ticket-1', {
      status: TicketStatus.OPEN,
    });
    expect(prisma.ticket.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: TicketStatus.OPEN, resolvedAt: null },
      }),
    );
  });

  it('forbids customers from changing anything but the status', async () => {
    await expect(
      service.update('org-1', customer, 'ticket-1', { priority: 'URGENT' }),
    ).rejects.toThrow(ForbiddenException);
    await expect(
      service.update('org-1', customer, 'ticket-1', {
        status: TicketStatus.RESOLVED,
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('keeps the original resolvedAt when staff move between done statuses', async () => {
    await service.update('org-1', agent, 'ticket-1', {
      status: TicketStatus.CLOSED,
    });
    const data = prisma.ticket.update.mock.calls[0][0].data;
    expect(data.resolvedAt).toEqual(ticket.resolvedAt);
    expect(gateway.emitTicketEvent).toHaveBeenCalled();
  });
});
