"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { useStaffMembers } from "@/modules/members/hooks/useMemberQueries";
import { Input, Select } from "@/shared/components/ui/input";

import { PRIORITY_ORDER, STATUS_ORDER } from "../consts/ticketOptions";
import type {
  TicketFilters,
  TicketPriority,
  TicketStatus
} from "../types/ticket.types";

type TicketFiltersBarProps = {
  orgId: string;
  isStaff: boolean;
  filters: TicketFilters;
  onChange: (changes: Partial<TicketFilters>) => void;
};

const SEARCH_DEBOUNCE_MS = 300;

export default function TicketFiltersBar({
  orgId,
  isStaff,
  filters,
  onChange
}: TicketFiltersBarProps) {
  const t = useTranslations("tickets");
  const tStatus = useTranslations("ticketStatus");
  const tPriority = useTranslations("ticketPriority");
  const staff = useStaffMembers(orgId, isStaff);
  const [search, setSearch] = useState(filters.search ?? "");

  useEffect(() => {
    if (search === (filters.search ?? "")) return;
    const timer = setTimeout(
      () => onChange({ search: search.trim() || undefined }),
      SEARCH_DEBOUNCE_MS
    );
    return () => clearTimeout(timer);
  }, [search, filters.search, onChange]);

  return (
    <div className='flex flex-wrap gap-3 border-b p-4'>
      <div className='relative min-w-52 flex-1'>
        <Search
          className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2'
          aria-hidden
        />
        <Input
          type='search'
          aria-label={t("searchLabel")}
          placeholder={t("searchPlaceholder")}
          className='pl-9'
          value={search}
          onChange={event => setSearch(event.target.value)}
        />
      </div>

      <Select
        aria-label={t("statusLabel")}
        className='w-auto'
        value={filters.status ?? ""}
        onChange={e =>
          onChange({
            status: (e.target.value || undefined) as TicketStatus | undefined
          })
        }
      >
        <option value=''>{t("allStatuses")}</option>
        {STATUS_ORDER.map(status => (
          <option key={status} value={status}>
            {tStatus(status)}
          </option>
        ))}
      </Select>

      <Select
        aria-label={t("priorityLabel")}
        className='w-auto'
        value={filters.priority ?? ""}
        onChange={e =>
          onChange({
            priority: (e.target.value || undefined) as
              TicketPriority | undefined
          })
        }
      >
        <option value=''>{t("allPriorities")}</option>
        {PRIORITY_ORDER.map(priority => (
          <option key={priority} value={priority}>
            {tPriority(priority)}
          </option>
        ))}
      </Select>

      {isStaff && (
        <Select
          aria-label={t("assigneeLabel")}
          className='w-auto'
          value={filters.assignee ?? ""}
          onChange={e => onChange({ assignee: e.target.value || undefined })}
        >
          <option value=''>{t("anyone")}</option>
          <option value='me'>{t("assignedToMe")}</option>
          <option value='unassigned'>{t("unassigned")}</option>
          {staff.data?.map(member => (
            <option key={member.user.id} value={member.user.id}>
              {member.user.name}
            </option>
          ))}
        </Select>
      )}
    </div>
  );
}
