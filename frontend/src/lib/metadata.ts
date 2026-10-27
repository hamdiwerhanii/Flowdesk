import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

type LocaleParams = { params: Promise<{ locale: string }> };

export const pageTitle =
  (key: string) =>
  async ({ params }: LocaleParams): Promise<Metadata> => {
    const { locale } = await params;
    const t = await getTranslations({ locale });
    return { title: t(key) };
  };
