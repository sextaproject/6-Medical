# Docker Commands Guide

## Quick Commands

Use the helper script:
```bash
./docker-commands.sh migrate-and-collectstatic
```

Or use docker-compose directly:

### Run Migrations
```bash
docker-compose run --rm backend python manage.py migrate
```

### Create Migrations
```bash
docker-compose run --rm backend python manage.py makemigrations
```

### Collect Static Files
```bash
docker-compose run --rm backend python manage.py collectstatic --noinput
```

### Run Both Migrations and Collect Static
```bash
docker-compose run --rm backend sh -c "python manage.py migrate && python manage.py collectstatic --noinput"
```

### Setup Users
```bash
docker-compose run --rm backend python manage.py setup_users
```

### Django Shell
```bash
docker-compose exec backend python manage.py shell
```

## Note

The `entrypoint.sh` script automatically runs migrations and collectstatic when the backend container starts. These manual commands are useful for:
- Running migrations manually before starting services
- Troubleshooting migration issues
- Updating static files without restarting the container
