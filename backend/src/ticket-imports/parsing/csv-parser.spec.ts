import { normalizeHeader, parseTicketCsv } from './csv-parser';

describe('normalizeHeader', () => {
  it('lowercases, trims and snake_cases headers, stripping a BOM', () => {
    expect(normalizeHeader('﻿ Requester Email ')).toBe('requester_email');
    expect(normalizeHeader('Assignee-Email')).toBe('assignee_email');
  });
});

describe('parseTicketCsv', () => {
  const header =
    'Subject,Description,Requester Email,Priority,Status,Assignee Email';

  it('rejects a file missing required columns', () => {
    const result = parseTicketCsv('Subject,Description\nHello,World');
    expect(result).toEqual({
      ok: false,
      error: 'Missing required columns: requester_email',
    });
  });

  it('rejects a file without data rows', () => {
    expect(parseTicketCsv(`${header}\n`)).toEqual({
      ok: false,
      error: 'The file has no data rows',
    });
  });

  it('parses valid rows and normalizes enum values and emails', () => {
    const result = parseTicketCsv(
      `${header}\nLogin broken,Cannot log in, KARIM@Client.test ,high,in progress,`,
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.rows).toEqual([
      {
        rowNumber: 2,
        errors: [],
        data: {
          subject: 'Login broken',
          description: 'Cannot log in',
          requester_email: 'karim@client.test',
          priority: 'HIGH',
          status: 'IN_PROGRESS',
          assignee_email: undefined,
        },
      },
    ]);
  });

  it('collects per-row errors with spreadsheet row numbers', () => {
    const result = parseTicketCsv(
      `${header}\nOk subject,Fine,a@b.test,,,\nab,,not-an-email,extreme,,`,
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.rows[0].errors).toEqual([]);
    expect(result.rows[1].rowNumber).toBe(3);
    expect(result.rows[1].errors).toEqual(
      expect.arrayContaining([
        'subject must have at least 3 characters',
        'description is required',
        'requester_email is not a valid email',
      ]),
    );
    expect(result.rows[1].errors.some((e) => e.startsWith('priority'))).toBe(
      true,
    );
  });
});
