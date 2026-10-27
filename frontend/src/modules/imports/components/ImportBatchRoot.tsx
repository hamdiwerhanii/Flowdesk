"use client";

import { ArrowLeft, CheckCircle2, RotateCcw, SearchX } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Link } from "@/navigation";
import EmptyState from "@/shared/components/EmptyState";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Spinner } from "@/shared/components/ui/spinner";
import { Table, TBody, TD, TH, THead, TR } from "@/shared/components/ui/table";
import { useFormatters } from "@/shared/hooks/useFormatters";
import { useOrgContext } from "@/shared/hooks/useOrgContext";

import { useImportBatch, useImportMutations } from "../hooks/useImports";
import ImportStatusBadge from "./ImportStatusBadge";

export default function ImportBatchRoot({ batchId }: { batchId: string }) {
  const t = useTranslations("imports.batch");
  const { formatDateTime } = useFormatters();
  const { orgId, orgSlug } = useOrgContext();
  const batch = useImportBatch(orgId, batchId);
  const { commit, revert } = useImportMutations(orgId);
  const [onlyInvalid, setOnlyInvalid] = useState(false);
  const backHref = `/${orgSlug}/admin/imports`;

  if (batch.isPending) {
    return (
      <div className='flex justify-center py-24'>
        <Spinner />
      </div>
    );
  }
  if (batch.isError) {
    return (
      <EmptyState
        icon={SearchX}
        title={t("notFound")}
        action={
          <Button asChild variant='outline'>
            <Link href={backHref}>{t("backToList")}</Link>
          </Button>
        }
      />
    );
  }

  const data = batch.data;
  const rows = onlyInvalid
    ? data.rows.filter(row => row.status === "INVALID")
    : data.rows;

  const handleRevert = () => {
    if (window.confirm(t("revertConfirm", { count: data._count.tickets }))) {
      revert.mutate(batchId);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='space-y-3'>
        <Link
          href={backHref}
          className='text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm'
        >
          <ArrowLeft className='size-4' aria-hidden /> {t("back")}
        </Link>
        <div className='flex flex-wrap items-end justify-between gap-4'>
          <div className='space-y-1'>
            <h1 className='flex items-center gap-3 text-2xl font-semibold tracking-tight'>
              {data.fileName} <ImportStatusBadge status={data.status} />
            </h1>
            <p className='text-muted-foreground text-sm'>
              {t("summary", {
                total: data.totalRows,
                valid: data.validRows,
                invalid: data.invalidRows,
                name: data.createdBy.name,
                date: formatDateTime(data.createdAt)
              })}
            </p>
          </div>
          <div className='flex gap-2'>
            {data.status === "PREVIEW" && (
              <Button
                disabled={data.validRows === 0 || commit.isPending}
                onClick={() => commit.mutate(batchId)}
              >
                {commit.isPending ? (
                  <Spinner className='text-current' />
                ) : (
                  <CheckCircle2 />
                )}
                {t("importRows", { count: data.validRows })}
              </Button>
            )}
            {data.status === "COMMITTED" && (
              <Button
                variant='outline'
                disabled={revert.isPending}
                onClick={handleRevert}
              >
                {revert.isPending ? <Spinner /> : <RotateCcw />}
                {t("revert")}
              </Button>
            )}
          </div>
        </div>
      </div>

      <Card>
        <div className='flex items-center justify-between border-b p-4'>
          <p className='text-sm font-medium'>{t("rows")}</p>
          <label className='flex items-center gap-2 text-sm'>
            <input
              type='checkbox'
              className='accent-primary size-4'
              checked={onlyInvalid}
              onChange={e => setOnlyInvalid(e.target.checked)}
            />
            {t("onlyInvalid")}
          </label>
        </div>
        <Table>
          <THead>
            <tr>
              <TH className='w-16'>{t("columnRow")}</TH>
              <TH>{t("columnSubject")}</TH>
              <TH>{t("columnRequester")}</TH>
              <TH>{t("columnStatus")}</TH>
              <TH>{t("columnProblems")}</TH>
            </tr>
          </THead>
          <TBody>
            {rows.map(row => (
              <TR key={row.id}>
                <TD className='text-muted-foreground font-mono text-xs'>
                  {row.rowNumber}
                </TD>
                <TD className='max-w-xs truncate'>{row.data.subject || "—"}</TD>
                <TD className='text-muted-foreground'>
                  {row.data.requester_email || "—"}
                </TD>
                <TD>
                  <ImportStatusBadge status={row.status} />
                </TD>
                <TD>
                  {/* Row errors come from the server in English (they name CSV columns). */}
                  {row.errors.length ? (
                    <ul className='text-danger list-disc space-y-0.5 pl-4 text-xs'>
                      {row.errors.map(error => (
                        <li key={error}>{error}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className='text-muted-foreground text-xs'>—</span>
                  )}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>
    </div>
  );
}
