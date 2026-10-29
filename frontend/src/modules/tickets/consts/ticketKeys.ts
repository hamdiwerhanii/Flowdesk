import type { TicketFilters } from "@/types/ticketTypes";

export const ticketKeys = {
  all: (orgId: string) => ["tickets", orgId] as const,
  lists: (orgId: string) => [...ticketKeys.all(orgId), "list"] as const,
  list: (orgId: string, filters: TicketFilters) =>
    [...ticketKeys.lists(orgId), filters] as const,
  detail: (orgId: string, ticketId: string) =>
    [...ticketKeys.all(orgId), "detail", ticketId] as const,
  comments: (orgId: string, ticketId: string) =>
    [...ticketKeys.detail(orgId, ticketId), "comments"] as const
};
