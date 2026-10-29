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
import { Button } from "@/shared/components/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/shared/components/Card";
import EmptyState from "@/shared/components/EmptyState";
import { Reveal } from "@/shared/components/Motion";
import { Skeleton } from "@/shared/components/Skeleton";
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
      <div className='space-y-6' role='status' aria-busy>
        <Skeleton className='h-36 w-full rounded-3xl' />
        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className='h-32' />
          ))}
        </div>
        <Skeleton className='h-80 w-full' />
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
      <Reveal className='mb-6'>
        <section className='relative overflow-hidden rounded-3xl bg-linear-to-br from-teal-600 via-teal-700 to-emerald-800 px-7 py-8 text-white shadow-lg shadow-teal-900/10'>
          <div
            className='animate-float pointer-events-none absolute -top-16 -right-10 size-64 rounded-full bg-white/10 blur-2xl'
            aria-hidden
          />
          <div
            className='animate-float pointer-events-none absolute -bottom-24 left-1/3 size-56 rounded-full bg-amber-300/20 blur-3xl [animation-delay:-4s]'
            aria-hidden
          />
          <p className='relative text-sm font-medium text-teal-100'>
            {orgName}
          </p>
          <h1 className='relative mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl'>
            {t("dashboard.greeting", { name: user.name.split(" ")[0] })}
          </h1>
          <p className='relative mt-2 max-w-xl text-sm text-teal-50/85'>
            {t("dashboard.description", { org: orgName })}
          </p>
        </section>
      </Reveal>

      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        <Reveal index={1} className='h-full'>
          <StatCard
            tone='teal'
            label={t("dashboard.openTickets")}
            value={open}
            icon={Inbox}
            hint={t("dashboard.openHint")}
          />
        </Reveal>
        <Reveal index={2} className='h-full'>
          <StatCard
            tone='amber'
            label={t("dashboard.unassigned")}
            value={stats.unassignedOpen}
            icon={UserX}
            hint={t("dashboard.unassignedHint")}
          />
        </Reveal>
        <Reveal index={3} className='h-full'>
          <StatCard
            tone='indigo'
            label={t("dashboard.assignedToMe")}
            value={stats.assignedToMeOpen}
            icon={UserRound}
          />
        </Reveal>
        <Reveal index={4} className='h-full'>
          <StatCard
            tone='emerald'
            label={t("dashboard.resolvedWeek")}
            value={stats.resolvedLast7Days}
            icon={CheckCircle2}
            hint={t("dashboard.createdWeek", { count: stats.createdLast7Days })}
          />
        </Reveal>
      </div>

      <div className='mt-6 grid gap-6 lg:grid-cols-3'>
        <Card className='animate-fade-up [animation-delay:250ms] lg:col-span-2'>
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
                {stats.recentTickets.map((ticket, index) => (
                  <li
                    key={ticket.id}
                    className='animate-fade-up'
                    style={{ animationDelay: `${300 + index * 50}ms` }}
                  >
                    <Link
                      href={ticketPath(orgSlug, role, ticket.id)}
                      className='hover:bg-primary-soft/60 group flex flex-wrap items-center gap-x-3 gap-y-1 px-6 py-3.5 transition-colors'
                    >
                      <span className='text-muted-foreground font-mono text-xs'>
                        {formatTicketNumber(ticket.number)}
                      </span>
                      <span className='group-hover:text-primary min-w-0 flex-1 truncate text-sm font-semibold transition-colors'>
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
          <Card className='animate-fade-up [animation-delay:320ms]'>
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
