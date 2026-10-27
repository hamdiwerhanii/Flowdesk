import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import type { ApiError } from "@/api/api.client";
import { ticketsApi } from "@/api/tickets.api";
import { dashboardKeys } from "@/modules/dashboard/consts/dashboardKeys";

import { ticketKeys } from "../consts/ticketKeys";
import type {
  CreateCommentInput,
  CreateTicketInput,
  Ticket,
  UpdateTicketInput
} from "../types/ticket.types";

const showError = (error: ApiError) => toast.error(error.message);

export function useCreateTicket(orgId: string) {
  const queryClient = useQueryClient();
  const t = useTranslations("toasts");
  return useMutation<Ticket, ApiError, CreateTicketInput>({
    mutationFn: data => ticketsApi.create(orgId, data),
    onSuccess: ticket => {
      queryClient.setQueryData(ticketKeys.detail(orgId, ticket.id), ticket);
      void queryClient.invalidateQueries({ queryKey: ticketKeys.lists(orgId) });
      void queryClient.invalidateQueries({
        queryKey: dashboardKeys.all(orgId)
      });
      toast.success(t("ticketCreated", { number: ticket.number }));
    },
    onError: showError
  });
}

export function useUpdateTicket(orgId: string, ticketId: string) {
  const queryClient = useQueryClient();
  return useMutation<Ticket, ApiError, UpdateTicketInput>({
    mutationFn: data => ticketsApi.update(orgId, ticketId, data),
    onSuccess: ticket => {
      queryClient.setQueryData(ticketKeys.detail(orgId, ticketId), ticket);
      void queryClient.invalidateQueries({ queryKey: ticketKeys.lists(orgId) });
      void queryClient.invalidateQueries({
        queryKey: dashboardKeys.all(orgId)
      });
    },
    onError: showError
  });
}

export function useDeleteTicket(orgId: string) {
  const queryClient = useQueryClient();
  const t = useTranslations("toasts");
  return useMutation<void, ApiError, string>({
    mutationFn: ticketId => ticketsApi.remove(orgId, ticketId),
    onSuccess: (_data, ticketId) => {
      queryClient.removeQueries({
        queryKey: ticketKeys.detail(orgId, ticketId)
      });
      void queryClient.invalidateQueries({ queryKey: ticketKeys.lists(orgId) });
      void queryClient.invalidateQueries({
        queryKey: dashboardKeys.all(orgId)
      });
      toast.success(t("ticketDeleted"));
    },
    onError: showError
  });
}

export function useAddComment(orgId: string, ticketId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCommentInput) =>
      ticketsApi.addComment(orgId, ticketId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ticketKeys.detail(orgId, ticketId)
      });
      void queryClient.invalidateQueries({ queryKey: ticketKeys.lists(orgId) });
    },
    onError: showError
  });
}
