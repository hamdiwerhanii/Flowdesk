"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Inbox,
  UserRound,
  UserX
} from "lucide-react";
import { useTranslations } from "next-intl";

import { PriorityLabel, StatusBadge } from "@/modules/tickets";
import {
  PRIORITY_DOT,
  PRIORITY_ORDER,
  STATUS_ORDER
} from "@/modules/tickets/consts/ticketOptions";
import {
  formatTicketNumber,
  ticketPath,
  ticketsPath
} from "@/modules/tickets/utils/ticketPaths";
import { Link } from "@/navigation";
import EmptyState from "@/shared/components/EmptyState";
import PageHeader from "@/shared/components/PageHeader";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/shared/components/ui/card";
import { Spinner } from "@/shared/components/ui/spinner";
import { useFormatters } from "@/shared/hooks/useFormatters";
import { useOrgContext } from "@/shared/hooks/useOrgContext";

import { useDashboard } from "../hooks/useDashboardQuery";
import BreakdownList from "./BreakdownList";
import StatCard from "./StatCard";

const STATUS_BARS: Record<string, string> = {
  OPEN: "bg-sky-500",
  IN_PROGRESS: "bg-violet-500",
  WAITING: "bg-amber-500",
  RESOLVED: "bg-emerald-500",
  CLOSED: "bg-zinc-400"
};

export default function DashboardRoot() {
  const t = useTranslations();
  const { timeAgo } = useFormatters();
  const { orgId, orgSlug, orgName, role, user } = useOrgContext();
  const dashboard = useDashboard(orgId);

  if (dashboard.isPending) {
    return (
      <div className='flex justify-center py-24'>
        <Spinner />
      </div>
    );
  }
  if (dashboard.isError) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title={t("dashboard.loadError")}
        description={dashboard.error.message}
        action={
          <Button onClick={() => dashboard.refetch()}>
            {t("common.tryAgain")}
          </Button>
        }
      />
    );
  }

  const stats = dashboard.data;
  const open =
    stats.statusCounts.OPEN +
    stats.statusCounts.IN_PROGRESS +
    stats.statusCounts.WAITING;

  return (
    <>
      <PageHeader
        title={t("dashboard.greeting", { name: user.name.split(" ")[0] })}
        description={t("dashboard.description", { org: orgName })}
      />

      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        <StatCard
          label={t("dashboard.openTickets")}
          value={open}
          icon={Inbox}
          hint={t("dashboard.openHint")}
        />
        <StatCard
          label={t("dashboard.unassigned")}
          value={stats.unassignedOpen}
          icon={UserX}
          hint={t("dashboard.unassignedHint")}
        />
        <StatCard
          label={t("dashboard.assignedToMe")}
          value={stats.assignedToMeOpen}
          icon={UserRound}
        />
        <StatCard
          label={t("dashboard.resolvedWeek")}
          value={stats.resolvedLast7Days}
          icon={CheckCircle2}
          hint={t("dashboard.createdWeek", { count: stats.createdLast7Days })}
        />
      </div>

      <div className='mt-6 grid gap-6 lg:grid-cols-3'>
        <Card className='lg:col-span-2'>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle>{t("dashboard.recentlyUpdated")}</CardTitle>
            <Button asChild variant='link' size='sm'>
              <Link href={ticketsPath(orgSlug, role)}>
                {t("dashboard.viewAll")}
              </Link>
            </Button>
          </CardHeader>
          <CardContent className='px-0'>
            {stats.recentTickets.length === 0 ? (
              <p className='text-muted-foreground px-5 text-sm'>
                {t("dashboard.noTickets")}
              </p>
            ) : (
              <ul className='divide-y'>
                {stats.recentTickets.map(ticket => (
                  <li key={ticket.id}>
                    <Link
                      href={ticketPath(orgSlug, role, ticket.id)}
                      className='hover:bg-muted/60 flex flex-wrap items-center gap-x-3 gap-y-1 px-5 py-3'
                    >
                      <span className='text-muted-foreground font-mono text-xs'>
                        {formatTicketNumber(ticket.number)}
                      </span>
                      <span className='min-w-0 flex-1 truncate text-sm font-medium'>
                        {ticket.subject}
                      </span>
                      <PriorityLabel priority={ticket.priority} />
                      <StatusBadge status={ticket.status} />
                      <span className='text-muted-foreground w-28 text-right text-xs'>
                        {timeAgo(ticket.updatedAt)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.byStatus")}</CardTitle>
            </CardHeader>
            <CardContent>
              <BreakdownList
                items={STATUS_ORDER.map(status => ({
                  key: status,
                  label: t(`ticketStatus.${status}`),
                  value: stats.statusCounts[status],
                  barClass: STATUS_BARS[status]
                }))}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.openByPriority")}</CardTitle>
            </CardHeader>
            <CardContent>
              <BreakdownList
                items={PRIORITY_ORDER.map(priority => ({
                  key: priority,
                  label: t(`ticketPriority.${priority}`),
                  value: stats.openPriorityCounts[priority],
                  barClass: PRIORITY_DOT[priority]
                }))}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
