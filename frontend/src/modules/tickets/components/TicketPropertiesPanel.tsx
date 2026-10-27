"use client";

import { RotateCcw, Trash2, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { useStaffMembers } from "@/modules/members/hooks/useMemberQueries";
import { useRouter } from "@/navigation";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/shared/components/ui/card";
import { Label, Select } from "@/shared/components/ui/input";
import { useFormatters } from "@/shared/hooks/useFormatters";
import { Role } from "@/types/role.types";

import {
  DONE_STATUSES,
  PRIORITY_ORDER,
  STATUS_ORDER
} from "../consts/ticketOptions";
import { useDeleteTicket, useUpdateTicket } from "../hooks/useTicketMutations";
import {
  type Ticket,
  type TicketPriority,
  TicketStatus
} from "../types/ticket.types";
import { ticketsPath } from "../utils/ticketPaths";
import { PriorityLabel, StatusBadge } from "./TicketBadges";

type TicketPropertiesPanelProps = {
  orgId: string;
  orgSlug: string;
  role: Role;
  isStaff: boolean;
  ticket: Ticket;
};

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className='flex items-center justify-between gap-3 text-sm'>
      <span className='text-muted-foreground'>{label}</span>
      <span className='text-right'>{children}</span>
    </div>
  );
}

export default function TicketPropertiesPanel({
  orgId,
  orgSlug,
  role,
  isStaff,
  ticket
}: TicketPropertiesPanelProps) {
  const t = useTranslations();
  const { formatDateTime } = useFormatters();
  const update = useUpdateTicket(orgId, ticket.id);
  const remove = useDeleteTicket(orgId);
  const staff = useStaffMembers(orgId, isStaff);
  const router = useRouter();
  const isDone = DONE_STATUSES.includes(ticket.status);

  const handleDelete = () => {
    if (!window.confirm(t("tickets.deleteConfirm", { number: ticket.number })))
      return;
    remove.mutate(ticket.id, {
      onSuccess: () => router.replace(ticketsPath(orgSlug, role))
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("tickets.details")}</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {isStaff ? (
          <>
            <div className='space-y-1.5'>
              <Label htmlFor='ticket-status'>{t("tickets.statusLabel")}</Label>
              <Select
                id='ticket-status'
                value={ticket.status}
                disabled={update.isPending}
                onChange={e =>
                  update.mutate({ status: e.target.value as TicketStatus })
                }
              >
                {STATUS_ORDER.map(status => (
                  <option key={status} value={status}>
                    {t(`ticketStatus.${status}`)}
                  </option>
                ))}
              </Select>
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='ticket-priority'>
                {t("tickets.priorityLabel")}
              </Label>
              <Select
                id='ticket-priority'
                value={ticket.priority}
                disabled={update.isPending}
                onChange={e =>
                  update.mutate({ priority: e.target.value as TicketPriority })
                }
              >
                {PRIORITY_ORDER.map(priority => (
                  <option key={priority} value={priority}>
                    {t(`ticketPriority.${priority}`)}
                  </option>
                ))}
              </Select>
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='ticket-assignee'>
                {t("tickets.assigneeLabel")}
              </Label>
              <Select
                id='ticket-assignee'
                value={ticket.assigneeId ?? ""}
                disabled={update.isPending || staff.isPending}
                onChange={e =>
                  update.mutate({ assigneeId: e.target.value || null })
                }
              >
                <option value=''>{t("tickets.unassigned")}</option>
                {/* Keep the current assignee visible while the list loads. */}
                {ticket.assignee && !staff.data && (
                  <option value={ticket.assignee.id}>
                    {ticket.assignee.name}
                  </option>
                )}
                {staff.data?.map(member => (
                  <option key={member.user.id} value={member.user.id}>
                    {member.user.name}
                  </option>
                ))}
              </Select>
            </div>
          </>
        ) : (
          <>
            <Row label={t("tickets.statusLabel")}>
              <StatusBadge status={ticket.status} />
            </Row>
            <Row label={t("tickets.priorityLabel")}>
              <PriorityLabel priority={ticket.priority} />
            </Row>
            <Row label={t("tickets.assignedTo")}>
              {ticket.assignee?.name ?? t("tickets.notAssignedYet")}
            </Row>
          </>
        )}

        <div className='space-y-2 border-t pt-4'>
          <Row label={t("tickets.requester")}>{ticket.requester.name}</Row>
          <Row label={t("tickets.created")}>
            {formatDateTime(ticket.createdAt)}
          </Row>
          {ticket.resolvedAt && (
            <Row label={t("tickets.resolved")}>
              {formatDateTime(ticket.resolvedAt)}
            </Row>
          )}
          {isStaff && (
            <Row label={t("tickets.source")}>
              {t(`ticketSource.${ticket.source}`)}
            </Row>
          )}
        </div>

        {!isStaff && (
          <Button
            variant='outline'
            className='w-full'
            disabled={update.isPending}
            onClick={() =>
              update.mutate({
                status: isDone ? TicketStatus.OPEN : TicketStatus.CLOSED
              })
            }
          >
            {isDone ? <RotateCcw /> : <XCircle />}
            {t(isDone ? "tickets.reopenTicket" : "tickets.closeTicket")}
          </Button>
        )}

        {role === Role.ADMIN && (
          <Button
            variant='ghost'
            className='text-danger hover:bg-danger-soft w-full'
            disabled={remove.isPending}
            onClick={handleDelete}
          >
            <Trash2 /> {t("tickets.deleteTicket")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
