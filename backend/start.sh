#!/bin/sh
set -e

# Run Prisma migrations to ensure the DB schema is up-to-date
npx prisma migrate deploy

# Start the NestJS application
node dist/main.js
