export const Role = {
  ADMIN: "ADMIN",
  AGENT: "AGENT",
  CUSTOMER: "CUSTOMER"
} as const;
export type Role = (typeof Role)[keyof typeof Role];
