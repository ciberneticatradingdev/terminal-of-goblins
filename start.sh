#!/bin/bash
set -e

echo "Waiting for database to be ready..."
for i in $(seq 1 30); do
  if npx prisma migrate deploy 2>/dev/null; then
    echo "Database ready, migrations applied."
    break
  fi
  if [ $i -eq 30 ]; then
    echo "ERROR: Database not reachable after 30 attempts. Starting anyway..."
    break
  fi
  echo "Attempt $i/30 — DB not ready, retrying in 2s..."
  sleep 2
done

echo "Starting server..."
node .next/standalone/server.js
