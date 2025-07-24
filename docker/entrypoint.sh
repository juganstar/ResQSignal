#!/bin/bash
set -e

# Debug: Show environment variables
echo "DB Connection Info:"
echo "Host: ${POSTGRES_HOST}"
echo "Port: ${POSTGRES_PORT}"
echo "User: ${POSTGRES_USER}"
echo "DB: ${POSTGRES_DB}"

# Create migrations directory if it doesn't exist
mkdir -p /app/backend/migrations
chmod -R a+w /app/backend/migrations

# Wait for PostgreSQL with timeout
export PGPASSWORD="${POSTGRES_PASSWORD}"
echo "Waiting for PostgreSQL to become available..."
timeout=30
while ! psql -h "${POSTGRES_HOST}" -p "${POSTGRES_PORT}" -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -c '\q'; do
  sleep 1
  timeout=$((timeout-1))
  if [ $timeout -eq 0 ]; then
    echo "PostgreSQL not available, giving up"
    exit 1
  fi
done

echo "PostgreSQL is available - proceeding with migrations"

# Run migrations
if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "⚠️ Cleaning broken migration (users.0004)..."

  # Step 1: Delete broken migration file (just in case)
  rm -f /app/backend/users/migrations/0004_profile_has_used_trial_profile_payment_method_added_and_more.py

  # Step 2: Fake back to the last valid migration (0003)
  python manage.py migrate users 0003 --fake

  # Step 3: Recreate the correct migration
  python manage.py makemigrations users

  # Step 4: Apply everything normally
  echo "Running migrate (fixed)..."
  python manage.py migrate --noinput

  echo "Collecting static files..."
  python manage.py collectstatic --noinput
fi

# Start server
echo "Starting Django development server..."
exec python manage.py runserver 0.0.0.0:8000
