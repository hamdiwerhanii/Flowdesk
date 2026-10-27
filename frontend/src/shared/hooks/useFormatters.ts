import { useLocale } from "next-intl";
import { useMemo } from "react";

import { formatDateTime, timeAgo } from "@/lib/date";

export function useFormatters() {
  const locale = useLocale();
  return useMemo(
    () => ({
      timeAgo: (date: string | Date) => timeAgo(date, locale),
      formatDateTime: (date: string | Date) => formatDateTime(date, locale)
    }),
    [locale]
  );
}
