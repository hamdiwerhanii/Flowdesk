"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/navigation";
import { Table, TBody, TD, TH, THead, TR } from "@/shared/components/ui/table";
import { useFormatters } from "@/shared/hooks/useFormatters";
import type { Role } from "@/types/role.types";

import type { Ticket } from "../types/ticket.types";
import { formatTicketNumber, ticketPath } from "../utils/ticketPaths";
import { PriorityLabel, StatusBadge } from "./TicketBadges";

type TicketTableProps = {
  tickets: Ticket[];
  orgSlug: string;
  role: Role;
  isStaff: boolean;
};

export default function TicketTable({
  tickets,
  orgSlug,
  role,
  isStaff
}: TicketTableProps) {
  const t = useTranslations("tickets");
  const { timeAgo } = useFormatters();

  return (
    <Table>
      <THead>
        <tr>
          <TH className='w-20'>#</TH>
          <TH>{t("columns.subject")}</TH>
          <TH>{t("columns.status")}</TH>
          <TH>{t("columns.priority")}</TH>
          {isStaff && <TH>{t("columns.assignee")}</TH>}
          <TH className='text-right'>{t("columns.updated")}</TH>
        </tr>
      </THead>
      <TBody>
        {tickets.map(ticket => (
          <TR key={ticket.id}>
            <TD className='text-muted-foreground font-mono text-xs'>
              {formatTicketNumber(ticket.number)}
            </TD>
            <TD className='max-w-md'>
              <Link
                href={ticketPath(orgSlug, role, ticket.id)}
                className='hover:text-primary block truncate font-medium'
              >
                {ticket.subject}
              </Link>
              {isStaff && (
                <span className='text-muted-foreground block truncate text-xs'>
                  {ticket.requester.name}
                </span>
              )}
            </TD>
            <TD>
              <StatusBadge status={ticket.status} />
            </TD>
            <TD>
              <PriorityLabel priority={ticket.priority} />
            </TD>
            {isStaff && (
              <TD className='text-muted-foreground'>
                {ticket.assignee?.name ?? (
                  <span className='italic'>{t("unassigned")}</span>
                )}
              </TD>
            )}
            <TD className='text-muted-foreground text-right whitespace-nowrap'>
              {timeAgo(ticket.updatedAt)}
            </TD>
          </TR>
        ))}
      </TBody>
    </Table>
  );
}
