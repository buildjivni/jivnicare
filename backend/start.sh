#!/bin/sh
set -e

echo "========================================="
echo "BOOT_START: Starting Railway Container"
echo "ENV_LOADED: Checking environment variables"

if [ -z "$DATABASE_URL" ]; then
  echo "CRITICAL ERROR: DATABASE_URL is missing in Railway Variables!"
  echo "Please add DATABASE_URL to your Railway project settings."
  exit 1
else
  echo "DATABASE_URL_PRESENT: Yes"
fi

echo "MIGRATION_START: Running Prisma migrations..."
npx prisma migrate deploy
echo "MIGRATION_DONE: Prisma migrations completed successfully."

echo "SERVER_LISTEN_START: Booting NestJS application..."
exec node dist/main.js
