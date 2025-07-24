#!/bin/bash
set -e

echo "DB Connection Info:"
echo "Host: ${POSTGRES_HOST}"
echo "Port: ${POSTGRES_PORT}"
echo "User: ${POSTGRES_USER}"
echo "DB: ${POSTGRES_DB}"

# Wait for PostgreSQL
export PGPASSWORD="${POSTGRES_PASSWORD}"
echo "Waiting for PostgreSQL..."
timeout=30
while ! psql -h "${POSTGRES_HOST}" -p "${POSTGRES_PORT}" -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -c '\q'; do
  sleep 1
  timeout=$((timeout - 1))
  if [ $timeout -eq 0 ]; then
    echo "PostgreSQL not available, giving up"
    exit 1
  fi
done

echo "PostgreSQL is ready."

# Only run if migrations are enabled
if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "⚠️ Rolling back users app to 0003 (safe checkpoint)..."
  python manage.py migrate users 0003 --fake

  echo "🧹 Removing broken 0004 migration if it exists..."
  rm -f /app/backend/users/migrations/0004*.py

  echo "⚙️ Recreating migration for new fields..."
  python manage.py makemigrations users

  echo "📦 Applying all migrations..."
  python manage.py migrate --noinput

  echo "🎯 Collecting static files..."
  python manage.py collectstatic --noinput
fi

# Start Django
echo "🚀 Starting Django..."
exec python manage.py runserver 0.0.0.0:8000
