# livesignal# Build and run
docker-compose --env-file .env.dev up --build

# Apply migrations
docker-compose exec web python manage.py migrate

# Create superuser
docker-compose exec web python manage.py createsuperuser
