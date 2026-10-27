"use client";

import { AlertTriangle, Inbox, Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/navigation";
import EmptyState from "@/shared/components/EmptyState";
import PageHeader from "@/shared/components/PageHeader";
import Pagination from "@/shared/components/Pagination";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Spinner } from "@/shared/components/ui/spinner";
import { useOrgContext } from "@/shared/hooks/useOrgContext";

import { useTicketFilters } from "../hooks/useTicketFilters";
import { useTickets } from "../hooks/useTicketQueries";
import { newTicketPath } from "../utils/ticketPaths";
import TicketFiltersBar from "./TicketFiltersBar";
import TicketTable from "./TicketTable";

/** Ticket list for every role; the API scopes customers to their own tickets. */
export default function TicketListRoot() {
  const t = useTranslations("tickets");
  const tCommon = useTranslations("common");
  const { orgId, orgSlug, role, isStaff } = useOrgContext();
  const { filters, setFilters } = useTicketFilters();
  const tickets = useTickets(orgId, filters);
  const hasFilters = !!(
    filters.status ||
    filters.priority ||
    filters.assignee ||
    filters.search
  );

  const emptyBody = hasFilters
    ? t("emptyFilteredBody")
    : t(isStaff ? "emptyStaffBody" : "emptyCustomerBody");

  return (
    <>
      <PageHeader
        title={t(isStaff ? "staffTitle" : "customerTitle")}
        description={
          isStaff
            ? tickets.data
              ? t("staffDescription", { count: tickets.data.meta.total })
              : undefined
            : t("customerDescription")
        }
        actions={
          <Button asChild>
            <Link href={newTicketPath(orgSlug, role)}>
              <Plus /> {t("newTicket")}
            </Link>
          </Button>
        }
      />

      <Card>
        <TicketFiltersBar
          orgId={orgId}
          isStaff={isStaff}
          filters={filters}
          onChange={setFilters}
        />

        {tickets.isPending ? (
          <div className='flex justify-center py-16'>
            <Spinner />
          </div>
        ) : tickets.isError ? (
          <EmptyState
            icon={AlertTriangle}
            title={t("loadError")}
            description={tickets.error.message}
            action={
              <Button variant='outline' onClick={() => tickets.refetch()}>
                {tCommon("tryAgain")}
              </Button>
            }
          />
        ) : tickets.data.data.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title={t(hasFilters ? "emptyFilteredTitle" : "emptyTitle")}
            description={emptyBody}
          />
        ) : (
          <div className={tickets.isPlaceholderData ? "opacity-60" : undefined}>
            <TicketTable
              tickets={tickets.data.data}
              orgSlug={orgSlug}
              role={role}
              isStaff={isStaff}
            />
            <Pagination
              page={filters.page}
              totalPages={tickets.data.meta.totalPages}
              onPageChange={page => setFilters({ page })}
            />
          </div>
        )}
      </Card>
    </>
  );
}
