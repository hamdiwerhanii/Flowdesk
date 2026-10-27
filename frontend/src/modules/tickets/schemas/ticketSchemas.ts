import { z } from "zod";

import { TicketPriority } from "../types/ticket.types";

const ticketFields = {
  subject: z
    .string()
    .trim()
    .min(3, "validation.minChars3")
    .max(200, "validation.maxChars200"),
  description: z
    .string()
    .trim()
    .min(10, "validation.descriptionMin")
    .max(10_000, "validation.tooLong"),
  priority: z.enum(TicketPriority)
};

/** Customers leave requester/assignee empty; the API uses the caller. */
export const newTicketSchema = z.object({
  ...ticketFields,
  requesterId: z.string(),
  /** Empty string = unassigned. */
  assigneeId: z.string()
});
export type TicketFormValues = z.infer<typeof newTicketSchema>;

/** Staff open tickets for a customer, so the requester is required. */
export const staffTicketSchema = newTicketSchema.extend({
  requesterId: z.string().min(1, "validation.requesterRequired")
});

export const commentSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "validation.messageRequired")
    .max(10_000, "validation.tooLong"),
  isInternal: z.boolean()
});
export type CommentValues = z.infer<typeof commentSchema>;
