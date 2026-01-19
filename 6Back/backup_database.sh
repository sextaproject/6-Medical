#!/bin/bash
# Database backup script for migration to DigitalOcean

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/sexta_medical_backup_${TIMESTAMP}.sql"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "Creating database backup..."
echo "Backup file: $BACKUP_FILE"

# Backup using docker-compose exec
docker-compose exec -T db pg_dump -U sexta_user sexta_medical_db > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Backup created successfully!"
    echo "   File: $BACKUP_FILE"
    echo "   Size: $(du -h "$BACKUP_FILE" | cut -f1)"
    echo ""
    echo "To restore on DigitalOcean:"
    echo "  1. Copy this file to your DigitalOcean droplet"
    echo "  2. Run: psql -U sexta_user -d sexta_medical_db < $BACKUP_FILE"
else
    echo "❌ Backup failed!"
    exit 1
fi
