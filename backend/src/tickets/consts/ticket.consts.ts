import { TicketStatus } from '@prisma/client';

/** Statuses that count as "done" (resolvedAt is set). */
export const DONE_STATUSES: TicketStatus[] = [
  TicketStatus.RESOLVED,
  TicketStatus.CLOSED,
];

/** The only status changes a customer may make: close, or reopen. */
export const CUSTOMER_STATUS_CHANGES: TicketStatus[] = [
  TicketStatus.CLOSED,
  TicketStatus.OPEN,
];

/** A customer reply moves a ticket in one of these statuses back to OPEN. */
export const REOPEN_ON_CUSTOMER_REPLY: TicketStatus[] = [
  TicketStatus.WAITING,
  TicketStatus.RESOLVED,
];
