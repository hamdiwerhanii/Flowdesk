import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { ticketsApi } from "@/api/tickets.api";
import type { TicketFilters } from "@/types/ticketTypes";

import { ticketKeys } from "../consts/ticketKeys";

export function useTickets(orgId: string, filters: TicketFilters) {
  return useQuery({
    queryKey: ticketKeys.list(orgId, filters),
    queryFn: () => ticketsApi.list(orgId, filters),
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
