import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { ticketsApi } from "@/api/tickets.api";

import { ticketKeys } from "../consts/ticketKeys";
import type { TicketFilters } from "../types/ticket.types";

export function useTickets(orgId: string, filters: TicketFilters) {
  return useQuery({
    queryKey: ticketKeys.list(orgId, filters),
    queryFn: () => ticketsApi.list(orgId, filters),
    // Keeps the current page on screen while the next one loads.
    placeholderData: keepPreviousData,
    enabled: !!orgId
  });
}

export function useTicket(orgId: string, ticketId: string) {
  return useQuery({
    queryKey: ticketKeys.detail(orgId, ticketId),
    queryFn: () => ticketsApi.get(orgId, ticketId),
    enabled: !!orgId && !!ticketId
  });
}

export function useTicketComments(orgId: string, ticketId: string) {
  return useQuery({
    queryKey: ticketKeys.comments(orgId, ticketId),
    queryFn: () => ticketsApi.comments(orgId, ticketId),
    enabled: !!orgId && !!ticketId
  });
}
