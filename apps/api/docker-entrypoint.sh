#!/bin/sh
set -e

echo "Running database migrations..."
pnpm run db:migrate-prod

echo "Starting application..."
exec "$@"
