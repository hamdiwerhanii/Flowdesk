import { CheckCircle2, Headset } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { Suspense } from "react";

import LocaleSwitcher from "@/shared/components/LocaleSwitcher";

const POINTS = ["point1", "point2", "point3"] as const;

export default async function AuthLayout({
  children
}: {
  children: ReactNode;
}) {
  const t = await getTranslations();

  return (
    <div className='grid min-h-screen lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]'>
      <aside className='relative hidden overflow-hidden bg-linear-to-br from-teal-600 via-teal-700 to-emerald-800 p-12 text-white lg:flex lg:flex-col lg:justify-between'>
        <div
          className='animate-float pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-white/10 blur-3xl'
          aria-hidden
        />
        <div
          className='animate-float pointer-events-none absolute -bottom-32 -left-20 size-96 rounded-full bg-amber-300/20 blur-3xl [animation-delay:-4.5s]'
          aria-hidden
        />
        <div className='relative flex items-center gap-2.5'>
          <span className='grid size-10 place-items-center rounded-xl bg-white/15 ring-1 ring-white/25'>
            <Headset className='size-5' aria-hidden />
          </span>
          <span className='text-xl font-bold tracking-tight'>
            {t("common.appName")}
          </span>
        </div>
        <div className='relative max-w-md space-y-6'>
          <h2 className='text-4xl leading-tight font-bold tracking-tight'>
            {t("authBrand.title")}
          </h2>
          <p className='text-lg text-teal-50/85'>{t("authBrand.subtitle")}</p>
          <ul className='space-y-3'>
            {POINTS.map(point => (
              <li key={point} className='flex items-center gap-3 text-teal-50'>
                <CheckCircle2 className='size-5 text-amber-300' aria-hidden />
                {t(`authBrand.${point}`)}
              </li>
            ))}
          </ul>
        </div>
        <p className='relative text-sm text-teal-100/70'>
          © {new Date().getFullYear()} {t("common.appName")}
        </p>
      </aside>

      <main className='relative flex items-center justify-center px-4 py-12 sm:px-8'>
        <div className='absolute top-4 right-4'>
          <Suspense>
            <LocaleSwitcher />
          </Suspense>
        </div>
        {children}
      </main>
    </div>
  );
}
