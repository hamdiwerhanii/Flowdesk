import type { Ticket, TicketPriority, TicketStatus } from "@/types/ticketTypes";

export type DashboardStats = {
  statusCounts: Record<TicketStatus, number>;
  openPriorityCounts: Record<TicketPriority, number>;
  unassignedOpen: number;
  assignedToMeOpen: number;
  createdLast7Days: number;
  resolvedLast7Days: number;
  recentTickets: Ticket[];
};
