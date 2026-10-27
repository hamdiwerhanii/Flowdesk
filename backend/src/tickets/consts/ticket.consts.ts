import { TicketStatus } from '@prisma/client';

export const DONE_STATUSES: TicketStatus[] = [
  TicketStatus.RESOLVED,
  TicketStatus.CLOSED,
];

export const CUSTOMER_STATUS_CHANGES: TicketStatus[] = [
  TicketStatus.CLOSED,
  TicketStatus.OPEN,
];

export const REOPEN_ON_CUSTOMER_REPLY: TicketStatus[] = [
  TicketStatus.WAITING,
  TicketStatus.RESOLVED,
];
