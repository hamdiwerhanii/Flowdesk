import { type Role, roleSegment } from "@/types/role.types";

export const ticketsPath = (orgSlug: string, role: Role): string =>
  `/${orgSlug}/${roleSegment(role)}/tickets`;

export const ticketPath = (
  orgSlug: string,
  role: Role,
  ticketId: string
): string => `${ticketsPath(orgSlug, role)}/${ticketId}`;

export const newTicketPath = (orgSlug: string, role: Role): string =>
  `${ticketsPath(orgSlug, role)}/new`;

export const formatTicketNumber = (number: number): string => `#${number}`;
