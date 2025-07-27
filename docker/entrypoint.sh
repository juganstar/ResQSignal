#!/bin/bash
set -e

echo "📦 Running migrations..."
python manage.py migrate --noinput

echo "🎯 Collecting static files..."
python manage.py collectstatic --noinput

echo "🚀 Starting Django..."
exec python manage.py runserver 0.0.0.0:8000
