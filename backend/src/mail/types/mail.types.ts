export type Recipient = { email: string; name: string };

export type TicketMailContext = {
  number: number;
  subject: string;
  url: string;
  organizationName: string;
};
