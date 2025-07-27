#!/bin/bash
set -e

echo "📦 Applying database migrations..."
python manage.py migrate --noinput

echo "🎯 Collecting static files..."
python manage.py collectstatic --noinput

echo "🚀 Starting Django app..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:8000
