export const importKeys = {
  all: (orgId: string) => ["imports", orgId] as const,
  list: (orgId: string) => [...importKeys.all(orgId), "list"] as const,
  detail: (orgId: string, batchId: string) =>
    [...importKeys.all(orgId), "detail", batchId] as const
};

/** Template users can download to see the expected columns. */
export const IMPORT_TEMPLATE_CSV = [
  "subject,description,requester_email,priority,status,assignee_email",
  "Cannot log in,The login page shows an error after submitting.,karim@client.test,high,open,sami@acme.test",
  "Change billing address,Please update our billing address.,nour@client.test,low,,"
].join("\n");
