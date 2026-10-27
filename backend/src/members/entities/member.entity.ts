import type { Prisma } from '@prisma/client';
import { publicUserSelect } from '../../shared/consts/user-select';

export const memberSelect = {
  id: true,
  role: true,
  status: true,
  createdAt: true,
  user: { select: publicUserSelect },
} satisfies Prisma.MembershipSelect;

export type MemberEntity = Prisma.MembershipGetPayload<{
  select: typeof memberSelect;
}>;
