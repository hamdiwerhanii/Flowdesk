import Papa from 'papaparse';
import { MAX_IMPORT_ROWS, REQUIRED_COLUMNS } from '../consts/import.consts';
import { TicketRow, ticketRowSchema } from './ticket-row.schema';

export type ParsedRow = {
  /** 1-based, counting the header as row 1 (matches a spreadsheet). */
  rowNumber: number;
  data: TicketRow | Record<string, string>;
  errors: string[];
};

export type ParseResult =
  { ok: true; rows: ParsedRow[] } | { ok: false; error: string };

/** `Requester Email` → `requester_email`. */
export const normalizeHeader = (header: string): string =>
  header
    .replace(/^\uFEFF/, '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

/** Step 1 of an import: CSV text → validated rows (no database access). */
export function parseTicketCsv(text: string): ParseResult {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: normalizeHeader,
  });

  const columns = result.meta.fields ?? [];
  const missing = REQUIRED_COLUMNS.filter((c) => !columns.includes(c));
  if (missing.length) {
    return {
      ok: false,
      error: `Missing required columns: ${missing.join(', ')}`,
    };
  }
  if (result.data.length === 0) {
    return { ok: false, error: 'The file has no data rows' };
  }
  if (result.data.length > MAX_IMPORT_ROWS) {
    return { ok: false, error: `Too many rows (max ${MAX_IMPORT_ROWS})` };
  }

  const rows = result.data.map((raw, index): ParsedRow => {
    const rowNumber = index + 2;
    const parsed = ticketRowSchema.safeParse(raw);
    return parsed.success
      ? { rowNumber, data: parsed.data, errors: [] }
      : {
          rowNumber,
          data: raw,
          errors: parsed.error.issues.map((issue) => {
            const field = String(issue.path[0] ?? 'row');
            if (issue.code === 'invalid_type' && !raw[field]?.trim()) {
              return `${field} is required`;
            }
            return issue.message.startsWith(field)
              ? issue.message
              : `${field}: ${issue.message}`;
          }),
        };
  });
  return { ok: true, rows };
}
