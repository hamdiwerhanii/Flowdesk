import { type QueryKey, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { toast } from "sonner";

import { apiClient } from "@/api/api.client";
import { socketClient } from "@/api/socket.client";
import { accountKeys } from "@/modules/account-management/consts/accountKeys";
import useAuthStore from "@/modules/auth/store/authStore";
import { dashboardKeys } from "@/modules/dashboard/consts/dashboardKeys";
import { importKeys } from "@/modules/imports/consts/importKeys";
import { memberKeys } from "@/modules/members/consts/memberKeys";
import { ticketKeys } from "@/modules/tickets/consts/ticketKeys";
import {
  type CommentEventPayload,
  type MembershipChangedPayload,
  SocketEvent,
  type TicketEventPayload
} from "@/types/socket.types";

export function useRealtimeSync(
  orgId: string,
  userId: string,
  isStaff: boolean
) {
  const queryClient = useQueryClient();
  const t = useTranslations("toasts");

  useEffect(() => {
    if (!orgId) return;
    const invalidate = (queryKey: QueryKey) =>
      void queryClient.invalidateQueries({ queryKey });
    const forThisOrg =
      <T extends { orgId: string }>(handler: (payload: T) => void) =>
      (payload: T) => {
        if (payload.orgId === orgId) handler(payload);
      };

    const unsubscribers = [
      socketClient.on<TicketEventPayload>(
        SocketEvent.TICKET_CREATED,
        forThisOrg(() => {
          invalidate(ticketKeys.lists(orgId));
          invalidate(dashboardKeys.all(orgId));
          if (isStaff) toast.info(t("newTicket"));
        })
      ),
      socketClient.on<TicketEventPayload>(
        SocketEvent.TICKET_UPDATED,
        forThisOrg(({ ticketId }) => {
          invalidate(ticketKeys.detail(orgId, ticketId));
          invalidate(ticketKeys.lists(orgId));
          invalidate(dashboardKeys.all(orgId));
        })
      ),
      socketClient.on<TicketEventPayload>(
        SocketEvent.TICKET_DELETED,
        forThisOrg(({ ticketId }) => {
          queryClient.removeQueries({
            queryKey: ticketKeys.detail(orgId, ticketId)
          });
          invalidate(ticketKeys.lists(orgId));
          invalidate(dashboardKeys.all(orgId));
        })
      ),
      socketClient.on<CommentEventPayload>(
        SocketEvent.COMMENT_CREATED,
        forThisOrg(({ ticketId }) => {
          invalidate(ticketKeys.comments(orgId, ticketId));
          invalidate(ticketKeys.lists(orgId));
        })
      ),
      socketClient.on(
        SocketEvent.ACCOUNT_REQUEST_CREATED,
        forThisOrg(() => {
          invalidate(accountKeys.pending(orgId));
          toast.info(t("newAccountRequest"));
        })
      ),
      socketClient.on<MembershipChangedPayload>(
        SocketEvent.MEMBERSHIP_CHANGED,
        async payload => {
          if (payload.orgId === orgId) {
            invalidate(memberKeys.all(orgId));
            invalidate(accountKeys.pending(orgId));
          }
          if (payload.userId === userId) {
            await apiClient.refreshSession();
            await useAuthStore.getState().refreshUser();
            socketClient.reconnect();
          }
        }
      ),
      socketClient.on(
        SocketEvent.IMPORT_UPDATED,
        forThisOrg(() => {
          invalidate(importKeys.all(orgId));
          invalidate(ticketKeys.all(orgId));
          invalidate(dashboardKeys.all(orgId));
        })
      )
    ];
    return () => unsubscribers.forEach(unsubscribe => unsubscribe());
  }, [orgId, userId, isStaff, queryClient, t]);
}
