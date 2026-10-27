import type {
  Ticket,
  TicketPriority,
  TicketStatus
} from "@/modules/tickets/types/ticket.types";

export type DashboardStats = {
  statusCounts: Record<TicketStatus, number>;
  openPriorityCounts: Record<TicketPriority, number>;
  unassignedOpen: number;
  assignedToMeOpen: number;
  createdLast7Days: number;
  resolvedLast7Days: number;
  recentTickets: Ticket[];
};
