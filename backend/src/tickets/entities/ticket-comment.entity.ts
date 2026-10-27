import type { Prisma } from '@prisma/client';
import { publicUserSelect } from '../../shared/consts/user-select';

export const ticketCommentInclude = {
  author: { select: publicUserSelect },
} satisfies Prisma.TicketCommentInclude;

export type TicketCommentEntity = Prisma.TicketCommentGetPayload<{
  include: typeof ticketCommentInclude;
}>;
