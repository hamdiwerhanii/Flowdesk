import { MembershipStatus, Prisma, Role } from '@prisma/client';
import { STAFF_ROLES } from '../../decorators/role.decorator';
import type { ParsedRow } from '../parsing/csv-parser';
import type { TicketRow } from '../parsing/ticket-row.schema';

export type ResolvedTicketRow = TicketRow & {
  requesterId?: string;
  assigneeId?: string;
};

export type ResolvedRow = {
  rowNumber: number;
  data: ResolvedTicketRow | Record<string, string>;
  errors: string[];
};

type MemberLookup = Map<string, { userId: string; role: Role }>;

/** Loads the ACTIVE members whose emails appear in the rows (one query). */
export async function loadMembersByEmail(
  prisma: Prisma.TransactionClient,
  orgId: string,
  emails: string[],
): Promise<MemberLookup> {
  const memberships = await prisma.membership.findMany({
    where: {
      organizationId: orgId,
      status: MembershipStatus.ACTIVE,
      user: { email: { in: [...new Set(emails)] } },
    },
    select: { role: true, user: { select: { id: true, email: true } } },
  });
  return new Map(
    memberships.map((m) => [m.user.email, { userId: m.user.id, role: m.role }]),
  );
}

export const emailsInRows = (rows: ParsedRow[]): string[] =>
  rows.flatMap((row) => {
    if (row.errors.length) return [];
    const data = row.data as TicketRow;
    return data.assignee_email
      ? [data.requester_email, data.assignee_email]
      : [data.requester_email];
  });

/**
 * Step 2 of an import: emails → member ids. Requesters may be any member;
 * assignees must be staff. Rows that already failed parsing pass through.
 */
export function resolveRows(
  rows: ParsedRow[],
  members: MemberLookup,
): ResolvedRow[] {
  return rows.map((row) => {
    if (row.errors.length) return row;
    const data = row.data as TicketRow;
    const errors: string[] = [];

    const requester = members.get(data.requester_email);
    if (!requester) {
      errors.push(`requester ${data.requester_email} is not a member`);
    }

    const assignee = data.assignee_email
      ? members.get(data.assignee_email)
      : undefined;
    if (
      data.assignee_email &&
      (!assignee || !STAFF_ROLES.includes(assignee.role))
    ) {
      errors.push(`assignee ${data.assignee_email} is not an agent or admin`);
    }

    return {
      rowNumber: row.rowNumber,
      data: {
        ...data,
        requesterId: requester?.userId,
        assigneeId: assignee?.userId,
      },
      errors,
    };
  });
}
