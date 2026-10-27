import type { PublicUser } from "@/types/api.types";

export const TicketStatus = {
  OPEN: "OPEN",
  IN_PROGRESS: "IN_PROGRESS",
  WAITING: "WAITING",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED"
} as const;
export type TicketStatus = (typeof TicketStatus)[keyof typeof TicketStatus];

export const TicketPriority = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  URGENT: "URGENT"
} as const;
export type TicketPriority =
  (typeof TicketPriority)[keyof typeof TicketPriority];

export type Ticket = {
  id: string;
  number: number;
  organizationId: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  source: "PORTAL" | "AGENT" | "IMPORT";
  requesterId: string;
  assigneeId: string | null;
  requester: PublicUser;
  assignee: PublicUser | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TicketComment = {
  id: string;
  ticketId: string;
  body: string;
  isInternal: boolean;
  createdAt: string;
  author: PublicUser;
};

export type TicketFilters = {
  page: number;
  status?: TicketStatus;
  priority?: TicketPriority;
  /** `me`, `unassigned`, or a user id (staff only). */
  assignee?: string;
  search?: string;
};

export type CreateTicketInput = {
  subject: string;
  description: string;
  priority?: TicketPriority;
  /** Staff only: the customer the ticket is for. */
  requesterId?: string;
  /** Staff only. */
  assigneeId?: string;
};

export type UpdateTicketInput = Partial<{
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assigneeId: string | null;
}>;

export type CreateCommentInput = { body: string; isInternal?: boolean };
