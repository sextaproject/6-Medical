#!/bin/bash
# Database restore script for DigitalOcean deployment

if [ -z "$1" ]; then
    echo "Usage: $0 <backup_file.sql>"
    echo "Example: $0 backups/sexta_medical_backup_20240119_120000.sql"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "Restoring database from: $BACKUP_FILE"
echo "⚠️  WARNING: This will overwrite existing data!"

read -p "Are you sure? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

# Restore using docker-compose exec
docker-compose exec -T db psql -U sexta_user -d sexta_medical_db < "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Database restored successfully!"
    echo "Running migrations to ensure schema is up to date..."
    docker-compose exec backend python manage.py migrate --noinput
else
    echo "❌ Restore failed!"
    exit 1
fi
