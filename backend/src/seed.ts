/**
 * Demo data: one organization with an admin, two agents, two customers,
 * one pending signup and a few tickets. Safe to re-run (it upserts).
 *
 *   pnpm seed
 *
 * Every account uses the password "password123".
 */
import {
  MembershipStatus,
  PrismaClient,
  Role,
  TicketPriority,
  TicketStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const PASSWORD = 'password123';

const people = [
  { email: 'admin@acme.test', name: 'Amira Admin', role: Role.ADMIN },
  { email: 'sami@acme.test', name: 'Sami Agent', role: Role.AGENT },
  { email: 'lina@acme.test', name: 'Lina Agent', role: Role.AGENT },
  { email: 'karim@client.test', name: 'Karim Customer', role: Role.CUSTOMER },
  { email: 'nour@client.test', name: 'Nour Customer', role: Role.CUSTOMER },
  {
    email: 'pending@client.test',
    name: 'Pending Customer',
    role: Role.CUSTOMER,
    status: MembershipStatus.PENDING,
  },
];

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, 12);
  const org = await prisma.organization.upsert({
    where: { slug: 'acme' },
    update: {},
    create: { name: 'Acme Support', slug: 'acme' },
  });

  const users: Record<string, string> = {};
  for (const person of people) {
    const user = await prisma.user.upsert({
      where: { email: person.email },
      update: {},
      create: { email: person.email, name: person.name, passwordHash },
    });
    users[person.email] = user.id;
    await prisma.membership.upsert({
      where: {
        userId_organizationId: { userId: user.id, organizationId: org.id },
      },
      // Re-running the seed puts the demo signup back in the approval queue.
      update: person.status ? { status: person.status } : {},
      create: {
        userId: user.id,
        organizationId: org.id,
        role: person.role,
        status: person.status ?? MembershipStatus.ACTIVE,
      },
    });
  }

  if (
    (await prisma.ticket.count({ where: { organizationId: org.id } })) === 0
  ) {
    const tickets = [
      {
        subject: 'Cannot reset my password',
        description: 'The reset email never arrives.',
        priority: TicketPriority.HIGH,
        status: TicketStatus.OPEN,
        requester: 'karim@client.test',
        assignee: 'sami@acme.test',
      },
      {
        subject: 'Invoice shows the wrong VAT',
        description: 'Invoice #2031 applies 7% instead of 19%.',
        priority: TicketPriority.MEDIUM,
        status: TicketStatus.IN_PROGRESS,
        requester: 'nour@client.test',
        assignee: 'lina@acme.test',
      },
      {
        subject: 'Feature request: dark mode',
        description: 'It would be great to have a dark theme.',
        priority: TicketPriority.LOW,
        status: TicketStatus.WAITING,
        requester: 'karim@client.test',
        assignee: undefined,
      },
      {
        subject: 'Site down for our team',
        description: 'Nobody in our office can load the dashboard.',
        priority: TicketPriority.URGENT,
        status: TicketStatus.RESOLVED,
        requester: 'nour@client.test',
        assignee: 'sami@acme.test',
      },
    ];

    await prisma.$transaction(async (tx) => {
      for (const ticket of tickets) {
        const { ticketCounter } = await tx.organization.update({
          where: { id: org.id },
          data: { ticketCounter: { increment: 1 } },
        });
        const created = await tx.ticket.create({
          data: {
            organizationId: org.id,
            number: ticketCounter,
            subject: ticket.subject,
            description: ticket.description,
            priority: ticket.priority,
            status: ticket.status,
            resolvedAt:
              ticket.status === TicketStatus.RESOLVED ? new Date() : null,
            requesterId: users[ticket.requester],
            assigneeId: ticket.assignee ? users[ticket.assignee] : null,
          },
        });
        await tx.ticketComment.create({
          data: {
            ticketId: created.id,
            authorId: users[ticket.requester],
            body: 'Any update on this?',
          },
        });
      }
    });
  }

  console.log('Seeded organization "acme". Accounts (password: password123):');
  for (const person of people) {
    console.log(
      `  ${person.role.padEnd(8)} ${person.email}${person.status ? ' (pending)' : ''}`,
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
