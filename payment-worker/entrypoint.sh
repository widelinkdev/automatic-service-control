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

# ✅ Esperar a PostgreSQL
echo "Waiting for PostgreSQL at $DB_HOST:$DB_PORT..."
until PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c '\q' 2>/dev/null; do
  echo "PostgreSQL not ready yet, retrying..."
  sleep 2
done

echo "✅ PostgreSQL is ready!"


if [ ! -f ".env" ] && [ -f ".env.template" ]; then
    echo "🆕 Creating .env from .env.template"
    cp .env.template .env
    echo "✅ .env file created successfully from .env.template"
fi

echo "🚀 Starting Worker..."
exec npx tsx src/index.ts