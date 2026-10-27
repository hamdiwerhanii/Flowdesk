import type {
  CreateCommentInput,
  CreateTicketInput,
  Ticket,
  TicketComment,
  TicketFilters,
  UpdateTicketInput
} from "@/modules/tickets/types/ticket.types";
import type { Paginated } from "@/types/api.types";

import { apiClient, toQueryString } from "./api.client";

export const TICKETS_PAGE_SIZE = 20;

const base = (orgId: string) => `/organizations/${orgId}/tickets`;

export const ticketsApi = {
  list: (orgId: string, filters: TicketFilters) =>
    apiClient.get<Paginated<Ticket>>(
      `${base(orgId)}${toQueryString({ ...filters, limit: TICKETS_PAGE_SIZE })}`
    ),

  get: (orgId: string, ticketId: string) =>
    apiClient.get<Ticket>(`${base(orgId)}/${ticketId}`),

  create: (orgId: string, data: CreateTicketInput) =>
    apiClient.post<Ticket>(base(orgId), data),

  update: (orgId: string, ticketId: string, data: UpdateTicketInput) =>
    apiClient.patch<Ticket>(`${base(orgId)}/${ticketId}`, data),

  remove: (orgId: string, ticketId: string) =>
    apiClient.delete<void>(`${base(orgId)}/${ticketId}`),

  comments: (orgId: string, ticketId: string) =>
    apiClient.get<TicketComment[]>(`${base(orgId)}/${ticketId}/comments`),

  addComment: (orgId: string, ticketId: string, data: CreateCommentInput) =>
    apiClient.post<TicketComment>(`${base(orgId)}/${ticketId}/comments`, data)
};
