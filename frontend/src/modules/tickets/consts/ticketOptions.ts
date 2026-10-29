import { TicketPriority, TicketStatus } from "@/types/ticketTypes";

export const STATUS_ORDER: TicketStatus[] = [
  TicketStatus.OPEN,
  TicketStatus.IN_PROGRESS,
  TicketStatus.WAITING,
  TicketStatus.RESOLVED,
  TicketStatus.CLOSED
];

export const PRIORITY_ORDER: TicketPriority[] = [
  TicketPriority.LOW,
  TicketPriority.MEDIUM,
  TicketPriority.HIGH,
  TicketPriority.URGENT
];

export const STATUS_STYLES: Record<TicketStatus, string> = {
  OPEN: "bg-sky-100 text-sky-800",
  IN_PROGRESS: "bg-violet-100 text-violet-800",
  WAITING: "bg-amber-100 text-amber-800",
  RESOLVED: "bg-emerald-100 text-emerald-800",
  CLOSED: "bg-zinc-200 text-zinc-700"
};

export const PRIORITY_STYLES: Record<TicketPriority, string> = {
  LOW: "text-zinc-600",
  MEDIUM: "text-sky-700",
  HIGH: "text-orange-700",
  URGENT: "text-red-700"
};

export const PRIORITY_DOT: Record<TicketPriority, string> = {
  LOW: "bg-zinc-400",
  MEDIUM: "bg-sky-500",
  HIGH: "bg-orange-500",
  URGENT: "bg-red-600"
};

export const DONE_STATUSES: TicketStatus[] = [
  TicketStatus.RESOLVED,
  TicketStatus.CLOSED
];
