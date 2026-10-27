import { Injectable } from '@nestjs/common';
import { TicketPriority, TicketStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DONE_STATUSES } from '../tickets/consts/ticket.consts';
import { ticketInclude } from '../tickets/entities/ticket.entity';

const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(orgId: string, userId: string) {
    const openWhere = {
      organizationId: orgId,
      status: { notIn: DONE_STATUSES },
    };
    const weekAgo = new Date(Date.now() - 7 * DAY_MS);

    const [
      byStatus,
      openByPriority,
      unassigned,
      mine,
      created7d,
      resolved7d,
      recent,
    ] = await Promise.all([
      this.prisma.ticket.groupBy({
        by: ['status'],
        where: { organizationId: orgId },
        _count: { _all: true },
      }),
      this.prisma.ticket.groupBy({
        by: ['priority'],
        where: openWhere,
        _count: { _all: true },
      }),
      this.prisma.ticket.count({ where: { ...openWhere, assigneeId: null } }),
      this.prisma.ticket.count({ where: { ...openWhere, assigneeId: userId } }),
      this.prisma.ticket.count({
        where: { organizationId: orgId, createdAt: { gte: weekAgo } },
      }),
      this.prisma.ticket.count({
        where: { organizationId: orgId, resolvedAt: { gte: weekAgo } },
      }),
      this.prisma.ticket.findMany({
        where: { organizationId: orgId },
        include: ticketInclude,
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
    ]);

    // Fill every enum value so the frontend never deals with missing keys.
    const statusCounts = Object.fromEntries(
      Object.values(TicketStatus).map((s) => [
        s,
        byStatus.find((row) => row.status === s)?._count._all ?? 0,
      ]),
    ) as Record<TicketStatus, number>;
    const openPriorityCounts = Object.fromEntries(
      Object.values(TicketPriority).map((p) => [
        p,
        openByPriority.find((row) => row.priority === p)?._count._all ?? 0,
      ]),
    ) as Record<TicketPriority, number>;

    return {
      statusCounts,
      openPriorityCounts,
      unassignedOpen: unassigned,
      assignedToMeOpen: mine,
      createdLast7Days: created7d,
      resolvedLast7Days: resolved7d,
      recentTickets: recent,
    };
  }
}
