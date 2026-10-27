"use client";

import { Languages } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";

import { type Locale, locales } from "@/i18n/config";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "@/navigation";

/** Switches language and stays on the same page (query string included). */
export default function LocaleSwitcher({ className }: { className?: string }) {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const change = (next: Locale) => {
    const query = searchParams.toString();
    startTransition(() =>
      router.replace(query ? `${pathname}?${query}` : pathname, {
        locale: next
      })
    );
  };

  return (
    <label
      className={cn(
        "text-muted-foreground flex items-center gap-2 text-sm",
        className
      )}
    >
      <Languages className='size-4' aria-hidden />
      <span className='sr-only'>{t("common.language")}</span>
      <select
        value={locale}
        disabled={isPending}
        onChange={e => change(e.target.value as Locale)}
        className='focus-visible:ring-ring rounded-md bg-transparent py-1 pr-1 focus-visible:ring-2 focus-visible:outline-none'
      >
        {locales.map(code => (
          <option key={code} value={code}>
            {t(`locales.${code}`)}
          </option>
        ))}
      </select>
    </label>
  );
}
