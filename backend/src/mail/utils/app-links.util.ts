import { Role } from '@prisma/client';

/**
 * Email links omit the locale: the frontend proxy adds it and then sends
 * the user to the right workspace (or to login first).
 */
export const appLink = (appUrl: string, path: string): string =>
  `${appUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;

export const ticketLink = (
  appUrl: string,
  orgSlug: string,
  role: Role,
  ticketId: string,
): string =>
  appLink(appUrl, `${orgSlug}/${role.toLowerCase()}/tickets/${ticketId}`);

export const passwordLink = (
  appUrl: string,
  token: string,
  invite = false,
): string =>
  appLink(
    appUrl,
    `reset-password?token=${encodeURIComponent(token)}${invite ? '&invite=1' : ''}`,
  );
