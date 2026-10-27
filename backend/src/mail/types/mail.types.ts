export type Recipient = { email: string; name: string };

export type TicketMailContext = {
  number: number;
  subject: string;
  /** Absolute link to the ticket in the recipient's workspace. */
  url: string;
  organizationName: string;
};
