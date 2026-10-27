export const accountKeys = {
  pending: (orgId: string) => ["account-requests", orgId] as const
};
