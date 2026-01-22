#!/bin/bash
# =============================================================================
# Database Backup Script for SEXTA Medical
# =============================================================================
# Creates a SQL backup of the PostgreSQL database
# Backups are stored in ../backups/ directory (project root)
#
# Usage: ./backup_database.sh
# =============================================================================

set -e

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${PROJECT_ROOT}/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/sexta_medical_backup_${TIMESTAMP}.sql"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "=============================================="
echo "  SEXTA Medical - Database Backup"
echo "=============================================="
echo ""
echo "Backup file: $BACKUP_FILE"
echo ""

# Check if Docker containers are running
if ! docker-compose -f "${PROJECT_ROOT}/docker-compose.yml" ps | grep -q "sexta_medical_db.*Up"; then
    echo "❌ Error: Database container is not running!"
    echo "   Start it with: docker-compose up -d"
    exit 1
fi

echo "Creating database backup..."

# Backup using docker-compose exec
cd "$PROJECT_ROOT"
docker-compose exec -T db pg_dump -U sexta_user -d sexta_medical_db --clean --if-exists > "$BACKUP_FILE"

if [ $? -eq 0 ] && [ -s "$BACKUP_FILE" ]; then
    echo ""
    echo "✅ Backup created successfully!"
    echo "   File: $BACKUP_FILE"
    echo "   Size: $(du -h "$BACKUP_FILE" | cut -f1)"
    
    # Count records
    PATIENT_COUNT=$(docker-compose exec -T db psql -U sexta_user -d sexta_medical_db -t -c "SELECT COUNT(*) FROM \"ClinicalH_patient\";" 2>/dev/null | tr -d ' ')
    USER_COUNT=$(docker-compose exec -T db psql -U sexta_user -d sexta_medical_db -t -c "SELECT COUNT(*) FROM auth_user;" 2>/dev/null | tr -d ' ')
    
    echo ""
    echo "📊 Backup contains:"
    echo "   - Patients: ${PATIENT_COUNT:-0}"
    echo "   - Users: ${USER_COUNT:-0}"
    echo ""
    echo "=============================================="
    echo "  DEPLOYMENT INSTRUCTIONS"
    echo "=============================================="
    echo ""
    echo "To deploy to Digital Ocean:"
    echo ""
    echo "1. Copy backup to your droplet:"
    echo "   scp $BACKUP_FILE root@YOUR_DROPLET_IP:/root/6MEDICAL/backups/"
    echo ""
    echo "2. On the droplet, restore with:"
    echo "   cd /root/6MEDICAL && ./6Back/restore_database.sh backups/$(basename $BACKUP_FILE)"
    echo ""
else
    echo "❌ Backup failed or file is empty!"
    rm -f "$BACKUP_FILE"
    exit 1
fi
