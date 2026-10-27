import type { Prisma } from '@prisma/client';

/** User fields safe to return to other members (never passwordHash). */
export const publicUserSelect = {
  id: true,
  name: true,
  email: true,
} satisfies Prisma.UserSelect;

export type PublicUser = Prisma.UserGetPayload<{
  select: typeof publicUserSelect;
}>;
