#!/bin/bash
set -e

echo "📦 Applying database migrations..."
python manage.py migrate --noinput || (echo "❌ Migration failed" && exit 1)

echo "🎯 Collecting static files..."
python manage.py collectstatic --noinput

echo "⏳ Waiting a few seconds before starting server..."
sleep 3

echo "🚀 Starting Django app..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:8000
