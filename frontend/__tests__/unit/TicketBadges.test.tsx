import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";

import {
  PriorityLabel,
  StatusBadge
} from "@/modules/tickets/components/TicketBadges";

import messages from "../../locales/en.json";

const withIntl = (ui: React.ReactNode) =>
  render(
    <NextIntlClientProvider locale='en' messages={messages}>
      {ui}
    </NextIntlClientProvider>
  );

describe("ticket badges", () => {
  it("renders the translated status", () => {
    withIntl(<StatusBadge status='WAITING' />);
    expect(screen.getByText("Waiting on customer")).toBeInTheDocument();
  });

  it("renders the translated priority", () => {
    withIntl(<PriorityLabel priority='URGENT' />);
    expect(screen.getByText("Urgent")).toBeInTheDocument();
  });
});
