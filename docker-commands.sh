#!/bin/bash
# Helper script for common Docker Compose commands

set -e

case "$1" in
  migrate)
    echo "Running migrations..."
    docker-compose run --rm backend python manage.py migrate
    ;;
  makemigrations)
    echo "Creating migrations..."
    docker-compose run --rm backend python manage.py makemigrations
    ;;
  collectstatic)
    echo "Collecting static files..."
    docker-compose run --rm backend python manage.py collectstatic --noinput
    ;;
  migrate-and-collectstatic)
    echo "Running migrations and collecting static files..."
    docker-compose run --rm backend sh -c "python manage.py migrate && python manage.py collectstatic --noinput"
    ;;
  setup-users)
    echo "Setting up users..."
    docker-compose run --rm backend python manage.py setup_users
    ;;
  shell)
    docker-compose exec backend python manage.py shell
    ;;
  *)
    echo "Usage: $0 {migrate|makemigrations|collectstatic|migrate-and-collectstatic|setup-users|shell}"
    echo ""
    echo "Commands:"
    echo "  migrate                  - Run database migrations"
    echo "  makemigrations            - Create new migration files"
    echo "  collectstatic             - Collect static files"
    echo "  migrate-and-collectstatic - Run both migrate and collectstatic"
    echo "  setup-users               - Run setup_users management command"
    echo "  shell                     - Open Django shell"
    exit 1
    ;;
esac
