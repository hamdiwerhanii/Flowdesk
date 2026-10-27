/**
 * Server → client events. Mirrored in frontend/src/types/socket.types.ts.
 * Payloads carry ids only; clients refetch through the REST API, so the
 * socket never leaks data the REST permission checks would hide.
 */
export enum SocketEvent {
  TICKET_CREATED = 'ticket:created',
  TICKET_UPDATED = 'ticket:updated',
  TICKET_DELETED = 'ticket:deleted',
  COMMENT_CREATED = 'comment:created',
  ACCOUNT_REQUEST_CREATED = 'account:request:created',
  MEMBERSHIP_CHANGED = 'membership:changed',
  IMPORT_UPDATED = 'import:updated',
}

export type TicketEventPayload = { orgId: string; ticketId: string };

export type CommentEventPayload = TicketEventPayload & {
  commentId: string;
  isInternal: boolean;
};

export type AccountRequestPayload = { orgId: string; membershipId: string };

export type MembershipChangedPayload = { orgId: string; userId: string };

export type ImportEventPayload = { orgId: string; batchId: string };

/** Room names, in one place so services and the gateway agree. */
export const rooms = {
  user: (userId: string) => `user_${userId}`,
  org: (orgId: string) => `org_${orgId}`,
  orgStaff: (orgId: string) => `org_${orgId}_staff`,
  orgAdmins: (orgId: string) => `org_${orgId}_admins`,
};
