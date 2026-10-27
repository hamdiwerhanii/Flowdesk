import { pageTitle } from "@/lib/metadata";
import { NewTicketForm } from "@/modules/tickets";

export const generateMetadata = pageTitle("nav.newTicket");

export default function Page() {
  return <NewTicketForm />;
}
