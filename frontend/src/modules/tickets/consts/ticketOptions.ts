import { TicketPriority, TicketStatus } from "../types/ticket.types";

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
  OPEN: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  IN_PROGRESS:
    "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300",
  WAITING: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  RESOLVED:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  CLOSED: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
};

export const PRIORITY_STYLES: Record<TicketPriority, string> = {
  LOW: "text-zinc-600 dark:text-zinc-400",
  MEDIUM: "text-sky-700 dark:text-sky-400",
  HIGH: "text-orange-700 dark:text-orange-400",
  URGENT: "text-red-700 dark:text-red-400"
};

export const PRIORITY_DOT: Record<TicketPriority, string> = {
  LOW: "bg-zinc-400",
  MEDIUM: "bg-sky-500",
  HIGH: "bg-orange-500",
  URGENT: "bg-red-600"
};

/** Statuses a ticket is "done" in; customers can reopen from these. */
export const DONE_STATUSES: TicketStatus[] = [
  TicketStatus.RESOLVED,
  TicketStatus.CLOSED
];
