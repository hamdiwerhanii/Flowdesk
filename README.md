# Flowdesk

Helpdesk SaaS: organizations, role-based workspaces (admin / agent / customer),
tickets with real-time updates and internal notes, email notifications,
CSV ticket imports, English and French.

| Part     | Stack                                                                   | Port |
| -------- | ----------------------------------------------------------------------- | ---- |
| backend  | NestJS 11, Prisma 6, PostgreSQL 16, Socket.IO, Nodemailer + Handlebars  | 4000 |
| frontend | Next.js 16, React 19, TanStack Query, Zustand, next-intl, Tailwind 4    | 3005 |
| database | PostgreSQL 16 (Docker)                                                  | 5433 |
| mail     | Mailpit (Docker, development only) — inbox at http://localhost:8025     | 1025 |

One repository, two independent apps: `backend/` and `frontend/` each have
their own `package.json`, lockfile, Dockerfile and lint/format settings.

```
Flowdesk/
├── .github/workflows/
│   ├── ci-backend.yml     runs only when backend/** changes
│   └── ci-frontend.yml    runs only when frontend/** changes
├── .husky/pre-commit      Prettier + ESLint on staged files (each app's own rules)
├── backend/               NestJS API
├── frontend/              Next.js app
├── docker-compose.yml
└── package.json           repository tooling only (husky, lint-staged)
```

After cloning, run `pnpm install` at the root once to install the git hook.

## Run it locally (development)

```bash
# 1. Postgres + Mailpit (Docker Desktop must be running)
docker compose up -d

# 2. Backend
cd backend
cp .env.example .env          # set JWT_ACCESS_SECRET to a long random string
pnpm install
pnpm prisma migrate dev       # creates the tables
pnpm seed                     # demo organization "acme"
pnpm start:dev                # http://localhost:4000 — Swagger at /api

# 3. Frontend (new terminal)
cd frontend
cp .env.example .env.local
pnpm install
pnpm dev                      # http://localhost:3005
```

Every email the app sends lands in Mailpit: http://localhost:8025.

### Demo accounts (password `password123`)

| Role     | Email               |
| -------- | ------------------- |
| Admin    | admin@acme.test     |
| Agent    | sami@acme.test      |
| Agent    | lina@acme.test      |
| Customer | karim@client.test   |
| Customer | nour@client.test    |
| Pending  | pending@client.test |

`pending@client.test` cannot log in until an admin approves it under
**Account requests**. Re-running `pnpm seed` puts it back in the queue.

## Run the whole stack in Docker

```bash
docker compose --profile app up -d --build
```

Builds both Dockerfiles and starts Postgres, Mailpit, the API (it applies
migrations on start) and the web app on http://localhost:3005. Seed once with
`cd backend && pnpm seed` (it uses the same database on port 5433).

## Quality checks

Each app runs the same checks locally and in CI (`.github/workflows/ci.yml`):

```bash
pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

- **Backend tests (Jest):** role guard, ticket access rules, ticket
  notification rules, password links, CSV parsing and resolution, tokens.
- **Frontend tests (Vitest):** proxy routing rules, navigation, schemas, dates,
  badges, and a check that `fr.json` has exactly the keys and placeholders of
  `en.json`.
- **Pre-commit (Husky + lint-staged):** Prettier and ESLint on staged files.

## Emails

| When                                       | Who receives it        |
| ------------------------------------------ | ---------------------- |
| Forgot password                            | the user               |
| Admin adds a new person                    | invitation to set a password |
| Admin adds an existing Flowdesk user       | "you now have access"  |
| Customer signs up                          | the organization's admins |
| Admin approves a signup                    | the customer           |
| Ticket created                             | the requester (confirmation), the assignee |
| Ticket assigned to someone else            | the new assignee       |
| Staff reply (not internal notes)           | the requester          |
| Customer reply                             | the assignee           |
| Ticket resolved                            | the requester          |

Sending never blocks or fails the request that triggered it; failures are
logged. For guaranteed delivery at scale, move sending to a queue (BullMQ).

## How access works

- **Login** sets two httpOnly cookies: `access_token` (JWT, 15 min) and
  `refresh_token` (opaque, 7 days, stored hashed, rotated on every use; a reused
  old token revokes all sessions).
- **Password links** (reset and invitation) are single-use, stored hashed,
  expire (1 h / 72 h), and sign the user out everywhere when used.
- **Backend**: `JwtGuard` + `RoleGuard` are global. Any route with `:orgId`
  requires an ACTIVE membership in that organization, read from the database,
  and `@Roles()` narrows it further. Services add row-level rules (customers
  only see their own tickets; internal notes are staff-only).
- **Frontend**: `src/proxy.ts` only *decodes* the access token to pick the page
  (`/[locale]/[orgSlug]/admin|agent|customer`); it never holds the JWT secret.
  The backend verifies every request.
- **Real time**: the socket joins `user_<id>`, `org_<id>`, `org_<id>_staff`
  and `org_<id>_admins` rooms. Events carry ids only; the frontend refetches
  through the REST API.

## Translations

UI strings live in `frontend/locales/en.json` and `fr.json`. Form validation
messages are translation keys (`validation.*`) resolved by `<Field>`. The
language switcher is in the sidebar and on the login pages. Emails and API
error messages are English for now.

## CSV import format

Required columns: `subject, description, requester_email`.
Optional: `priority, status, assignee_email`. Headers are case-insensitive.
An upload creates a preview; nothing is created until you commit, and a
committed import can be reverted.
