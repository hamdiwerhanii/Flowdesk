#!/bin/sh
set -e

# Apply pending migrations before serving. Safe to run on every start:
# already-applied migrations are skipped.
./node_modules/.bin/prisma migrate deploy

# exec: Node becomes PID 1 and receives Docker's SIGTERM (graceful shutdown).
exec node dist/main
