import { TicketPriority, TicketStatus } from '@prisma/client';
import { z } from 'zod';

const emptyToUndefined = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

const upperEnum = <T extends Record<string, string>>(values: T) =>
  z.preprocess((value) => {
    const cleaned = emptyToUndefined(value);
    return typeof cleaned === 'string'
      ? cleaned
          .trim()
          .toUpperCase()
          .replace(/[\s-]+/g, '_')
      : cleaned;
  }, z.enum(values).optional());

export const ticketRowSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(3, 'subject must have at least 3 characters')
    .max(200),
  description: z.string().trim().min(1, 'description is required').max(10_000),
  requester_email: z
    .string()
    .trim()
    .toLowerCase()
    .email('requester_email is not a valid email'),
  priority: upperEnum(TicketPriority),
  status: upperEnum(TicketStatus),
  assignee_email: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .trim()
      .toLowerCase()
      .email('assignee_email is not a valid email')
      .optional(),
  ),
});

export type TicketRow = z.infer<typeof ticketRowSchema>;
