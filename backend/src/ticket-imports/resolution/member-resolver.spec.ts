import { Role } from '@prisma/client';
import type { ParsedRow } from '../parsing/csv-parser';
import { emailsInRows, resolveRows } from './member-resolver';

const row = (rowNumber: number, overrides = {}): ParsedRow => ({
  rowNumber,
  errors: [],
  data: {
    subject: 'Subject',
    description: 'Description',
    requester_email: 'customer@test',
    ...overrides,
  },
});

const members = new Map([
  ['customer@test', { userId: 'u-customer', role: Role.CUSTOMER }],
  ['agent@test', { userId: 'u-agent', role: Role.AGENT }],
]);

describe('member resolution', () => {
  it('lists requester and assignee emails of parseable rows only', () => {
    const rows = [
      row(2, { assignee_email: 'agent@test' }),
      { ...row(3), errors: ['broken'] },
    ];
    expect(emailsInRows(rows)).toEqual(['customer@test', 'agent@test']);
  });

  it('maps emails to member ids', () => {
    const [resolved] = resolveRows(
      [row(2, { assignee_email: 'agent@test' })],
      members,
    );
    expect(resolved.errors).toEqual([]);
    expect(resolved.data).toMatchObject({
      requesterId: 'u-customer',
      assigneeId: 'u-agent',
    });
  });

  it('flags unknown requesters and non-staff assignees', () => {
    const [resolved] = resolveRows(
      [
        row(2, {
          requester_email: 'ghost@test',
          assignee_email: 'customer@test',
        }),
      ],
      members,
    );
    expect(resolved.errors).toEqual([
      'requester ghost@test is not a member',
      'assignee customer@test is not an agent or admin',
    ]);
  });

  it('passes rows that failed parsing through unchanged', () => {
    const broken = { ...row(4), errors: ['subject is required'] };
    expect(resolveRows([broken], members)).toEqual([broken]);
  });
});
