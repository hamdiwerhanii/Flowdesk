"use client";

import { AlertTriangle, Download, FileSpreadsheet, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

import { Link, useRouter } from "@/navigation";
import EmptyState from "@/shared/components/EmptyState";
import PageHeader from "@/shared/components/PageHeader";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/shared/components/ui/card";
import { Spinner } from "@/shared/components/ui/spinner";
import { Table, TBody, TD, TH, THead, TR } from "@/shared/components/ui/table";
import { useFormatters } from "@/shared/hooks/useFormatters";
import { useOrgContext } from "@/shared/hooks/useOrgContext";

import { IMPORT_TEMPLATE_CSV } from "../consts/importKeys";
import { useImportBatches, useImportMutations } from "../hooks/useImports";
import ImportStatusBadge from "./ImportStatusBadge";

const downloadTemplate = () => {
  const url = URL.createObjectURL(
    new Blob([IMPORT_TEMPLATE_CSV], { type: "text/csv" })
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "flowdesk-tickets-template.csv";
  link.click();
  URL.revokeObjectURL(url);
};

export default function ImportsRoot() {
  const t = useTranslations("imports");
  const { timeAgo } = useFormatters();
  const { orgId, orgSlug } = useOrgContext();
  const batches = useImportBatches(orgId);
  const { upload } = useImportMutations(orgId);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = () => {
    if (!file) return;
    upload.mutate(file, {
      onSuccess: batch => router.push(`/${orgSlug}/admin/imports/${batch.id}`)
    });
  };

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />

      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>{t("uploadTitle")}</CardTitle>
          <CardDescription>{t("uploadDescription")}</CardDescription>
        </CardHeader>
        <CardContent className='flex flex-wrap items-center gap-3'>
          <input
            ref={inputRef}
            type='file'
            accept='.csv,text/csv'
            className='sr-only'
            id='csv-file'
            onChange={e => setFile(e.target.files?.[0] ?? null)}
          />
          <Button variant='outline' onClick={() => inputRef.current?.click()}>
            <FileSpreadsheet /> {file ? file.name : t("chooseFile")}
          </Button>
          <Button disabled={!file || upload.isPending} onClick={handleUpload}>
            {upload.isPending ? (
              <Spinner className='text-current' />
            ) : (
              <Upload />
            )}
            {t("upload")}
          </Button>
          <Button variant='link' onClick={downloadTemplate}>
            <Download /> {t("downloadTemplate")}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("history")}</CardTitle>
        </CardHeader>
        {batches.isPending ? (
          <div className='flex justify-center py-12'>
            <Spinner />
          </div>
        ) : batches.isError ? (
          <EmptyState
            icon={AlertTriangle}
            title={t("loadError")}
            description={batches.error.message}
          />
        ) : batches.data.length === 0 ? (
          <EmptyState icon={FileSpreadsheet} title={t("empty")} />
        ) : (
          <Table>
            <THead>
              <tr>
                <TH>{t("columnFile")}</TH>
                <TH>{t("columnStatus")}</TH>
                <TH>{t("columnRows")}</TH>
                <TH>{t("columnBy")}</TH>
                <TH className='text-right'>{t("columnUploaded")}</TH>
              </tr>
            </THead>
            <TBody>
              {batches.data.map(batch => (
                <TR key={batch.id}>
                  <TD>
                    <Link
                      href={`/${orgSlug}/admin/imports/${batch.id}`}
                      className='hover:text-primary font-medium'
                    >
                      {batch.fileName}
                    </Link>
                  </TD>
                  <TD>
                    <ImportStatusBadge status={batch.status} />
                  </TD>
                  <TD className='text-muted-foreground'>
                    {t("rowsSummary", {
                      valid: batch.validRows,
                      invalid: batch.invalidRows
                    })}
                  </TD>
                  <TD className='text-muted-foreground'>
                    {batch.createdBy.name}
                  </TD>
                  <TD className='text-muted-foreground text-right'>
                    {timeAgo(batch.createdAt)}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>
    </>
  );
}
