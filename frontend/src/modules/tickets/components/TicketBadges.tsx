"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { Badge } from "@/shared/components/Badge";
import type { TicketPriority, TicketStatus } from "@/types/ticketTypes";

import {
  PRIORITY_DOT,
  PRIORITY_STYLES,
  STATUS_STYLES
} from "../consts/ticketOptions";

export function StatusBadge({ status }: { status: TicketStatus }) {
  const t = useTranslations("ticketStatus");
  return <Badge className={STATUS_STYLES[status]}>{t(status)}</Badge>;
}

export function PriorityLabel({ priority }: { priority: TicketPriority }) {
  const t = useTranslations("ticketPriority");
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium",
        PRIORITY_STYLES[priority]
      )}
    >
      <span
        className={cn("size-2 rounded-full", PRIORITY_DOT[priority])}
        aria-hidden
      />
      {t(priority)}
    </span>
  );
}
