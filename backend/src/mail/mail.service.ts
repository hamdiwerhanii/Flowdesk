import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env.validation';
import type { Recipient, TicketMailContext } from './types/mail.types';
import { appLink } from './utils/app-links.util';

/**
 * One method per email, so callers never deal with template names.
 *
 * Sending is fire-and-forget: a slow or failing SMTP server must not fail
 * or slow down the API request that triggered the email. Failures are
 * logged. (For guaranteed delivery, move sending to a queue such as BullMQ.)
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly mailer: MailerService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  sendPasswordReset(to: Recipient, url: string, ttlMinutes: number) {
    this.send(to, 'Reset your Flowdesk password', 'password-reset', {
      name: to.name,
      url,
      ttlMinutes,
    });
  }

  sendInvitation(
    to: Recipient,
    url: string,
    organizationName: string,
    ttlHours: number,
  ) {
    this.send(
      to,
      `You've been invited to ${organizationName} on Flowdesk`,
      'invitation',
      {
        name: to.name,
        url,
        organizationName,
        ttlHours,
      },
    );
  }

  sendAddedToOrganization(to: Recipient, organizationName: string) {
    this.send(
      to,
      `You now have access to ${organizationName}`,
      'added-to-organization',
      {
        name: to.name,
        organizationName,
        url: this.link('login'),
      },
    );
  }

  sendAccountRequest(
    to: Recipient,
    requester: Recipient,
    organizationName: string,
    orgSlug: string,
  ) {
    this.send(
      to,
      `New account request for ${organizationName}`,
      'account-request',
      {
        name: to.name,
        requesterName: requester.name,
        requesterEmail: requester.email,
        organizationName,
        url: this.link(`${orgSlug}/admin/account-management`),
      },
    );
  }

  sendAccountApproved(to: Recipient, organizationName: string) {
    this.send(
      to,
      `Your ${organizationName} account is ready`,
      'account-approved',
      {
        name: to.name,
        organizationName,
        url: this.link('login'),
      },
    );
  }

  sendTicketReceived(to: Recipient, ticket: TicketMailContext) {
    this.send(
      to,
      `[#${ticket.number}] We received your request`,
      'ticket-received',
      {
        name: to.name,
        ...ticket,
      },
    );
  }

  sendTicketAssigned(
    to: Recipient,
    ticket: TicketMailContext,
    assignedBy: string,
  ) {
    this.send(
      to,
      `[#${ticket.number}] Assigned to you: ${ticket.subject}`,
      'ticket-assigned',
      {
        name: to.name,
        assignedBy,
        ...ticket,
      },
    );
  }

  sendTicketReply(
    to: Recipient,
    ticket: TicketMailContext,
    authorName: string,
    body: string,
  ) {
    this.send(
      to,
      `[#${ticket.number}] New reply: ${ticket.subject}`,
      'ticket-reply',
      {
        name: to.name,
        authorName,
        body,
        ...ticket,
      },
    );
  }

  sendTicketResolved(to: Recipient, ticket: TicketMailContext) {
    this.send(
      to,
      `[#${ticket.number}] Resolved: ${ticket.subject}`,
      'ticket-resolved',
      {
        name: to.name,
        ...ticket,
      },
    );
  }

  private link(path: string): string {
    return appLink(this.config.get('APP_URL', { infer: true }), path);
  }

  private send(
    to: Recipient,
    subject: string,
    template: string,
    context: Record<string, unknown>,
  ) {
    if (this.config.get('NODE_ENV', { infer: true }) === 'test') return;
    this.mailer
      .sendMail({
        to: { name: to.name, address: to.email },
        subject,
        template,
        context: {
          ...context,
          appUrl: this.link(''),
          year: new Date().getFullYear(),
        },
      })
      .catch((error: Error) =>
        this.logger.error(
          `Failed to send "${template}" to ${to.email}: ${error.message}`,
        ),
      );
  }
}
