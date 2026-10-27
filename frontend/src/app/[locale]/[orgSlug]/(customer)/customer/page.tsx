import { redirect } from "next/navigation";

type PageProps = { params: Promise<{ locale: string; orgSlug: string }> };

/** Customers land on their ticket list. */
export default async function CustomerHome({ params }: PageProps) {
  const { locale, orgSlug } = await params;
  redirect(`/${locale}/${orgSlug}/customer/tickets`);
}
