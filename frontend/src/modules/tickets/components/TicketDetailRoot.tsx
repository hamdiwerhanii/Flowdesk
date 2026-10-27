"use client";

import { ArrowLeft, SearchX } from "lucide-react";
import { useTranslations } from "next-intl";

import { isApiError } from "@/api/api.client";
import { Link } from "@/navigation";
import EmptyState from "@/shared/components/EmptyState";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { useOrgContext } from "@/shared/hooks/useOrgContext";

import { useTicket } from "../hooks/useTicketQueries";
import { formatTicketNumber, ticketsPath } from "../utils/ticketPaths";
import { PriorityLabel, StatusBadge } from "./TicketBadges";
import TicketConversation from "./TicketConversation";
import TicketPropertiesPanel from "./TicketPropertiesPanel";

export default function TicketDetailRoot({ ticketId }: { ticketId: string }) {
  const t = useTranslations("tickets");
  const { orgId, orgSlug, role, isStaff } = useOrgContext();
  const ticket = useTicket(orgId, ticketId);
  const backHref = ticketsPath(orgSlug, role);

  if (ticket.isPending) {
    return (
      <div className='flex justify-center py-24'>
        <Spinner />
      </div>
    );
  }

  if (ticket.isError) {
    const notFound =
      isApiError(ticket.error) && [400, 404].includes(ticket.error.status);
    return (
      <EmptyState
        icon={SearchX}
        title={t(notFound ? "notFoundTitle" : "loadOneError")}
        description={notFound ? t("notFoundBody") : ticket.error.message}
        action={
          <Button asChild variant='outline'>
            <Link href={backHref}>{t("backToList")}</Link>
          </Button>
        }
      />
    );
  }

  const data = ticket.data;
  return (
    <div className='space-y-6'>
      <div className='space-y-3'>
        <Link
          href={backHref}
          className='text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm'
        >
          <ArrowLeft className='size-4' aria-hidden /> {t("staffTitle")}
        </Link>
        <div className='space-y-2'>
          <h1 className='text-2xl font-semibold tracking-tight'>
            <span className='text-muted-foreground mr-2 font-mono text-lg'>
              {formatTicketNumber(data.number)}
            </span>
            {data.subject}
          </h1>
          <div className='flex flex-wrap items-center gap-3'>
            <StatusBadge status={data.status} />
            <PriorityLabel priority={data.priority} />
          </div>
        </div>
      </div>

      <div className='grid gap-6 lg:grid-cols-[1fr_300px]'>
        <TicketConversation orgId={orgId} ticket={data} isStaff={isStaff} />
        <aside className='lg:sticky lg:top-6 lg:self-start'>
          <TicketPropertiesPanel
            orgId={orgId}
            orgSlug={orgSlug}
            role={role}
            isStaff={isStaff}
            ticket={data}
          />
        </aside>
      </div>
    </div>
  );
}
