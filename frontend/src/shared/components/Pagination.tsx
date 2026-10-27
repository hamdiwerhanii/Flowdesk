"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "./ui/button";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({
  page,
  totalPages,
  onPageChange
}: PaginationProps) {
  const t = useTranslations("common");
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label={t("pagination")}
      className='flex items-center justify-between gap-3 border-t px-4 py-3'
    >
      <span className='text-muted-foreground text-sm'>
        {t("pageOf", { page, total: totalPages })}
      </span>
      <div className='flex gap-2'>
        <Button
          variant='outline'
          size='sm'
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft /> {t("previous")}
        </Button>
        <Button
          variant='outline'
          size='sm'
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          {t("next")} <ChevronRight />
        </Button>
      </div>
    </nav>
  );
}
