import type { Prisma } from '@prisma/client';

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
