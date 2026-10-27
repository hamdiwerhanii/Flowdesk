"use client";

import { useTranslations } from "next-intl";

import { Badge } from "@/shared/components/ui/badge";

import type { ImportBatchStatus, ImportRowStatus } from "../types/import.types";

const STYLES: Record<ImportBatchStatus | ImportRowStatus, string> = {
  PREVIEW: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  COMMITTED:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  REVERTED: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  VALID: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  INVALID: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  IMPORTED:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
};

export default function ImportStatusBadge({
  status
}: {
  status: ImportBatchStatus | ImportRowStatus;
}) {
  const t = useTranslations("imports.status");
  return <Badge className={STYLES[status]}>{t(status)}</Badge>;
}
