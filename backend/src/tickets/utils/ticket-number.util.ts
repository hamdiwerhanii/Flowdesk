import type { Prisma } from '@prisma/client';

/**
 * Reserves `count` consecutive ticket numbers for an organization and
 * returns the first one. The UPDATE row-locks the organization, so
 * concurrent creations inside transactions never get the same number.
 */
export async function allocateTicketNumbers(
  tx: Prisma.TransactionClient,
  orgId: string,
  count = 1,
): Promise<number> {
  const { ticketCounter } = await tx.organization.update({
    where: { id: orgId },
    data: { ticketCounter: { increment: count } },
    select: { ticketCounter: true },
  });
  return ticketCounter - count + 1;
}
