# scripts/make_migrations.py
from django.core.management import call_command

call_command("makemigrations", "users")
