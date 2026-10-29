import { roleSegment } from "@/shared/utils/role.utils";
import { type Role } from "@/types/roleTypes";

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
