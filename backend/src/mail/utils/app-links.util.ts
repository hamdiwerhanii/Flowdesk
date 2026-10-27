import { Role } from '@prisma/client';

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
