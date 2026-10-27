import type { Prisma } from '@prisma/client';
import { publicUserSelect } from '../../shared/consts/user-select';

export const ticketInclude = {
  requester: { select: publicUserSelect },
  assignee: { select: publicUserSelect },
} satisfies Prisma.TicketInclude;

export type TicketEntity = Prisma.TicketGetPayload<{
  include: typeof ticketInclude;
}>;
