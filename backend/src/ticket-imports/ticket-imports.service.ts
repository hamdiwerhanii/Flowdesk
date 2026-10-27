import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ImportBatchStatus,
  ImportRowStatus,
  Prisma,
  TicketPriority,
  TicketSource,
  TicketStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DONE_STATUSES } from '../tickets/consts/ticket.consts';
import { allocateTicketNumbers } from '../tickets/utils/ticket-number.util';
import { SocketEvent } from '../web-socket/types/events.types';
import { WebsocketGateway } from '../web-socket/web-socket.gateway';
import { parseTicketCsv, ParsedRow } from './parsing/csv-parser';
import {
  emailsInRows,
  loadMembersByEmail,
  ResolvedTicketRow,
  resolveRows,
} from './resolution/member-resolver';

const batchSummarySelect = {
  id: true,
  fileName: true,
  status: true,
  totalRows: true,
  validRows: true,
  invalidRows: true,
  committedAt: true,
  revertedAt: true,
  createdAt: true,
  createdBy: { select: { id: true, name: true } },
  _count: { select: { tickets: true } },
} satisfies Prisma.ImportBatchSelect;

/**
 * CSV ticket import in three steps:
 *   preview  → parsing/ + resolution/, rows stored with their errors
 *   commit   → valid rows become tickets (re-resolved, members may have changed)
 *   revert   → deletes the tickets created by the batch
 */
@Injectable()
export class TicketImportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: WebsocketGateway,
  ) {}

  async preview(orgId: string, userId: string, file: Express.Multer.File) {
    const parsed = parseTicketCsv(file.buffer.toString('utf8'));
    if (!parsed.ok) throw new BadRequestException(parsed.error);

    const members = await loadMembersByEmail(
      this.prisma,
      orgId,
      emailsInRows(parsed.rows),
    );
    const rows = resolveRows(parsed.rows, members);
    const validRows = rows.filter((row) => row.errors.length === 0).length;

    const batch = await this.prisma.importBatch.create({
      data: {
        organizationId: orgId,
        createdById: userId,
        fileName: file.originalname,
        totalRows: rows.length,
        validRows,
        invalidRows: rows.length - validRows,
        rows: {
          create: rows.map((row) => ({
            rowNumber: row.rowNumber,
            data: row.data as Prisma.InputJsonObject,
            errors: row.errors,
            status: row.errors.length
              ? ImportRowStatus.INVALID
              : ImportRowStatus.VALID,
          })),
        },
      },
      select: batchSummarySelect,
    });
    this.notify(orgId, batch.id);
    return batch;
  }

  list(orgId: string) {
    return this.prisma.importBatch.findMany({
      where: { organizationId: orgId },
      select: batchSummarySelect,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async findOne(orgId: string, batchId: string) {
    const batch = await this.prisma.importBatch.findFirst({
      where: { id: batchId, organizationId: orgId },
      select: {
        ...batchSummarySelect,
        rows: { orderBy: { rowNumber: 'asc' } },
      },
    });
    if (!batch) throw new NotFoundException('Import not found');
    return batch;
  }

  async commit(orgId: string, batchId: string) {
    const batch = await this.findOne(orgId, batchId);
    if (batch.status !== ImportBatchStatus.PREVIEW) {
      throw new ConflictException(
        `This import is already ${batch.status.toLowerCase()}`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      const candidates = batch.rows.filter(
        (row) => row.status === ImportRowStatus.VALID,
      );
      const asParsed: ParsedRow[] = candidates.map((row) => ({
        rowNumber: row.rowNumber,
        data: row.data as ResolvedTicketRow,
        errors: [],
      }));
      const members = await loadMembersByEmail(
        tx,
        orgId,
        emailsInRows(asParsed),
      );
      const resolved = resolveRows(asParsed, members);

      const importable = resolved.filter((row) => row.errors.length === 0);
      const firstNumber = importable.length
        ? await allocateTicketNumbers(tx, orgId, importable.length)
        : 0;

      await tx.ticket.createMany({
        data: importable.map((row, index) => {
          const data = row.data as ResolvedTicketRow;
          const status = (data.status as TicketStatus) ?? TicketStatus.OPEN;
          return {
            organizationId: orgId,
            number: firstNumber + index,
            subject: data.subject,
            description: data.description,
            priority:
              (data.priority as TicketPriority) ?? TicketPriority.MEDIUM,
            status,
            resolvedAt: DONE_STATUSES.includes(status) ? new Date() : null,
            requesterId: data.requesterId!,
            assigneeId: data.assigneeId,
            source: TicketSource.IMPORT,
            importBatchId: batchId,
          };
        }),
      });

      // Rows that stopped resolving since the preview are marked invalid.
      const nowInvalid = resolved.filter((row) => row.errors.length > 0);
      for (const row of nowInvalid) {
        await tx.importBatchRow.updateMany({
          where: { batchId, rowNumber: row.rowNumber },
          data: { status: ImportRowStatus.INVALID, errors: row.errors },
        });
      }
      await tx.importBatchRow.updateMany({
        where: {
          batchId,
          rowNumber: { in: importable.map((row) => row.rowNumber) },
        },
        data: { status: ImportRowStatus.IMPORTED },
      });
      await tx.importBatch.update({
        where: { id: batchId },
        data: {
          status: ImportBatchStatus.COMMITTED,
          committedAt: new Date(),
          validRows: importable.length,
          invalidRows: batch.totalRows - importable.length,
        },
      });
    });

    this.notify(orgId, batchId);
    return this.findOne(orgId, batchId);
  }

  async revert(orgId: string, batchId: string) {
    const batch = await this.findOne(orgId, batchId);
    if (batch.status !== ImportBatchStatus.COMMITTED) {
      throw new ConflictException('Only committed imports can be reverted');
    }

    await this.prisma.$transaction([
      this.prisma.ticket.deleteMany({
        where: { organizationId: orgId, importBatchId: batchId },
      }),
      this.prisma.importBatch.update({
        where: { id: batchId },
        data: { status: ImportBatchStatus.REVERTED, revertedAt: new Date() },
      }),
    ]);

    this.notify(orgId, batchId);
    return this.findOne(orgId, batchId);
  }

  private notify(orgId: string, batchId: string) {
    this.gateway.emitToOrgStaff(orgId, SocketEvent.IMPORT_UPDATED, {
      orgId,
      batchId,
    });
  }
}
