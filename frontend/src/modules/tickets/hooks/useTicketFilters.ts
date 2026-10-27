import { useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { usePathname, useRouter } from "@/navigation";

import { PRIORITY_ORDER, STATUS_ORDER } from "../consts/ticketOptions";
import type {
  TicketFilters,
  TicketPriority,
  TicketStatus
} from "../types/ticket.types";

export function useTicketFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const filters = useMemo((): TicketFilters => {
    const status = searchParams.get("status") as TicketStatus | null;
    const priority = searchParams.get("priority") as TicketPriority | null;
    const page = Number(searchParams.get("page"));
    return {
      page: Number.isInteger(page) && page > 0 ? page : 1,
      status: status && STATUS_ORDER.includes(status) ? status : undefined,
      priority:
        priority && PRIORITY_ORDER.includes(priority) ? priority : undefined,
      assignee: searchParams.get("assignee") ?? undefined,
      search: searchParams.get("search") ?? undefined
    };
  }, [searchParams]);

  const setFilters = useCallback(
    (changes: Partial<TicketFilters>) => {
      const next: TicketFilters = {
        ...filters,
        ...changes,
        page: changes.page ?? 1
      };
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(next)) {
        if (
          value !== undefined &&
          value !== "" &&
          !(key === "page" && value === 1)
        ) {
          params.set(key, String(value));
        }
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false
      });
    },
    [filters, pathname, router]
  );

  return { filters, setFilters };
}
