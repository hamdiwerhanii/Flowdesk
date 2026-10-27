import { pageTitle } from "@/lib/metadata";
import { TicketDetailRoot } from "@/modules/tickets";

export const generateMetadata = pageTitle("nav.tickets");

type PageProps = { params: Promise<{ ticketId: string }> };

export default async function Page({ params }: PageProps) {
  const { ticketId } = await params;
  return <TicketDetailRoot ticketId={ticketId} />;
}
