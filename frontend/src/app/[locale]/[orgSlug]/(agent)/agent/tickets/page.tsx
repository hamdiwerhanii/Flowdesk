import { Suspense } from "react";

import { pageTitle } from "@/lib/metadata";
import { TicketListRoot } from "@/modules/tickets";

export const generateMetadata = pageTitle("nav.tickets");

export default function Page() {
  return (
    <Suspense>
      <TicketListRoot />
    </Suspense>
  );
}
