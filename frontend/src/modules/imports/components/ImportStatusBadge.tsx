"use client";

import { useTranslations } from "next-intl";

import { Badge } from "@/shared/components/Badge";
import type { ImportBatchStatus, ImportRowStatus } from "@/types/importTypes";

const STYLES: Record<ImportBatchStatus | ImportRowStatus, string> = {
  PREVIEW: "bg-sky-100 text-sky-800",
  COMMITTED: "bg-emerald-100 text-emerald-800",
  REVERTED: "bg-zinc-200 text-zinc-700",
  VALID: "bg-sky-100 text-sky-800",
  INVALID: "bg-red-100 text-red-800",
  IMPORTED: "bg-emerald-100 text-emerald-800"
};

export default function ImportStatusBadge({
  status
}: {
  status: ImportBatchStatus | ImportRowStatus;
}) {
  const t = useTranslations("imports.status");
  return <Badge className={STYLES[status]}>{t(status)}</Badge>;
}
