export type ImportBatchStatus = "PREVIEW" | "COMMITTED" | "REVERTED";
export type ImportRowStatus = "VALID" | "INVALID" | "IMPORTED";

export type ImportBatch = {
  id: string;
  fileName: string;
  status: ImportBatchStatus;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  committedAt: string | null;
  revertedAt: string | null;
  createdAt: string;
  createdBy: { id: string; name: string };
  _count: { tickets: number };
};

export type ImportBatchRow = {
  id: string;
  rowNumber: number;
  data: Record<string, string | undefined>;
  errors: string[];
  status: ImportRowStatus;
};

export type ImportBatchDetail = ImportBatch & { rows: ImportBatchRow[] };
