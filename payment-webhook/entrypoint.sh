#!/bin/sh
set -e

echo "DEBUG: DATABASE_URL=$DATABASE_URL"

# Extraer credenciales de DATABASE_URL
DB_USER=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASSWORD=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:\/]*\)[:/].*/\1/p')
DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo "$DATABASE_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')

echo "DEBUG: USER=$DB_USER PASSWORD=$DB_PASSWORD HOST=$DB_HOST PORT=$DB_PORT NAME=$DB_NAME"

DB_PORT=${DB_PORT:-5432}

# ✅ Esperar a PostgreSQL (tanto para worker como webhook)
echo "Waiting for PostgreSQL at $DB_HOST:$DB_PORT..."
until PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c '\q' 2>/dev/null; do
  echo "PostgreSQL not ready yet, retrying..."
  sleep 2
done

echo "✅ PostgreSQL is ready!"

# Si no es worker, crear DB y extensiones
if [ "$WORKER_ENABLED" != "true" ]; then
  echo "Creating database if not exists..."
  PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -tc \
    "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
    PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c \
    "CREATE DATABASE \"$DB_NAME\""

  echo "Creating pgmq extension..."
  PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c \
    "CREATE EXTENSION IF NOT EXISTS pgmq CASCADE"

  echo "Running Prisma migrations..."
  npx prisma migrate deploy
fi

if [ ! -f ".env" ] && [ -f ".env.template" ]; then
    echo "🆕 Creating .env from .env.template"
    cp .env.template .env
	echo "✅ .env file created successfully from .env.template"
fi

if [ -z "$OLT_ENCRYPTION_KEY" ]; then
  export OLT_ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  echo "🆕 Generated OLT_ENCRYPTION_KEY: $OLT_ENCRYPTION_KEY"
fi

echo "🚀 Running insert_olts.ts script..."
npx tsx src/lib/insert_olts.ts

# ✅ Iniciar la aplicación (worker o webhook). Se usa el mismo proyecto sin duplicar.
if [ "$WORKER_ENABLED" = "true" ]; then
  echo "🚀 Starting Worker..."
  exec npx tsx src/lib/worker.ts
else
  echo "🚀 Starting Webhook API..."
  exec "$@"
fi