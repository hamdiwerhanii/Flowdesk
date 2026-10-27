# syntax=docker/dockerfile:1

# ---- base: Node + pnpm (version from package.json "packageManager") ----
FROM node:20-alpine AS base
RUN apk add --no-cache openssl && corepack enable
WORKDIR /app

# ---- build: all dependencies, compile TypeScript ----
FROM base AS build
# bcrypt may compile from source on Alpine.
RUN apk add --no-cache python3 make g++
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm prisma generate && pnpm build

# ---- prod-deps: production dependencies only, with the Prisma client ----
FROM base AS prod-deps
RUN apk add --no-cache python3 make g++
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile --prod && pnpm prisma generate

# ---- runner: small image, non-root user ----
FROM base AS runner
ENV NODE_ENV=production
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node prisma ./prisma
COPY --chown=node:node package.json ./
COPY --chown=node:node --chmod=755 entrypoint.sh ./entrypoint.sh
USER node

EXPOSE 4000
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 4000) + '/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

ENTRYPOINT ["./entrypoint.sh"]
