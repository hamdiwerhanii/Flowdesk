export const MAX_IMPORT_FILE_BYTES = 2 * 1024 * 1024;
export const MAX_IMPORT_ROWS = 1000;

/** Columns the CSV must contain (after header normalization). */
export const REQUIRED_COLUMNS = [
  'subject',
  'description',
  'requester_email',
] as const;

export const OPTIONAL_COLUMNS = [
  'priority',
  'status',
  'assignee_email',
] as const;
