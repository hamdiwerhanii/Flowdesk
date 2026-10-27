import { Suspense } from "react";

import { pageTitle } from "@/lib/metadata";
import { TicketListRoot } from "@/modules/tickets";

export const generateMetadata = pageTitle("nav.tickets");

// TicketListRoot reads the query string (useSearchParams).
export default function Page() {
  return (
    <Suspense>
      <TicketListRoot />
    </Suspense>
  );
}
