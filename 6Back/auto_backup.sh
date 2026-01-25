#!/bin/bash
# =============================================================================
# AUTOMATED Daily Backup Script for SEXTA Medical
# =============================================================================
# This script:
#   1. Creates a database backup on the droplet
#   2. Keeps last 7 days of backups locally (auto-deletes older ones)
#   3. Optionally syncs to external storage (DigitalOcean Spaces/S3/local)
#
# Setup (run this ONCE on your droplet):
#   chmod +x /root/6-Medical/6Back/auto_backup.sh
#   crontab -e
#   # Add this line for daily backup at 2 AM:
#   0 2 * * * /root/6-Medical/6Back/auto_backup.sh >> /var/log/sexta_backup.log 2>&1
#
# =============================================================================

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${PROJECT_ROOT}/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATE_TODAY=$(date +%Y%m%d)
BACKUP_FILE="${BACKUP_DIR}/sexta_medical_backup_${TIMESTAMP}.sql"
BACKUP_FILE_COMPRESSED="${BACKUP_FILE}.gz"

# How many days of backups to keep locally
RETENTION_DAYS=7

# External backup configuration (uncomment and configure ONE option)
# Option 1: DigitalOcean Spaces (recommended)
# SPACES_BUCKET="your-bucket-name"
# SPACES_ENDPOINT="nyc3.digitaloceanspaces.com"

# Option 2: AWS S3
# S3_BUCKET="your-s3-bucket-name"

# Option 3: Remote server via SCP
# REMOTE_USER="backup_user"
# REMOTE_HOST="backup.yourserver.com"
# REMOTE_PATH="/backups/sexta_medical"

# =============================================================================
# Functions
# =============================================================================

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

error_exit() {
    log "ERROR: $1"
    exit 1
}

# Auto-detect docker compose command (V1 vs V2)
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
elif docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    echo "ERROR: Neither 'docker-compose' nor 'docker compose' found!"
    exit 1
fi

# =============================================================================
# Main Backup Process
# =============================================================================

log "=============================================="
log "  SEXTA Medical - Automated Backup Starting"
log "=============================================="

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Change to project root for docker compose
cd "$PROJECT_ROOT"

# Check if database container is running
if ! $DOCKER_COMPOSE ps | grep -q "sexta_medical_db.*running\|sexta_medical_db.*Up"; then
    error_exit "Database container is not running!"
fi

# Create the backup
log "Creating database backup..."
$DOCKER_COMPOSE exec -T db pg_dump -U sexta_user -d sexta_medical_db --clean --if-exists > "$BACKUP_FILE"

if [ ! -s "$BACKUP_FILE" ]; then
    rm -f "$BACKUP_FILE"
    error_exit "Backup failed - file is empty!"
fi

# Compress the backup
log "Compressing backup..."
gzip -f "$BACKUP_FILE"

if [ ! -f "$BACKUP_FILE_COMPRESSED" ]; then
    error_exit "Compression failed!"
fi

BACKUP_SIZE=$(du -h "$BACKUP_FILE_COMPRESSED" | cut -f1)
log "✅ Backup created: $(basename $BACKUP_FILE_COMPRESSED) (${BACKUP_SIZE})"

# Get record counts for logging
PATIENT_COUNT=$($DOCKER_COMPOSE exec -T db psql -U sexta_user -d sexta_medical_db -t -c "SELECT COUNT(*) FROM \"ClinicalH_patient\";" 2>/dev/null | tr -d ' ' || echo "?")
NOTE_COUNT=$($DOCKER_COMPOSE exec -T db psql -U sexta_user -d sexta_medical_db -t -c "SELECT COUNT(*) FROM \"ClinicalH_clinicalnote\";" 2>/dev/null | tr -d ' ' || echo "?")

log "📊 Backup contains: ${PATIENT_COUNT} patients, ${NOTE_COUNT} clinical notes"

# =============================================================================
# Cleanup old local backups (keep last N days)
# =============================================================================

log "Cleaning up backups older than ${RETENTION_DAYS} days..."
find "$BACKUP_DIR" -name "sexta_medical_backup_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete 2>/dev/null || true
find "$BACKUP_DIR" -name "sexta_medical_backup_*.sql" -type f -mtime +${RETENTION_DAYS} -delete 2>/dev/null || true

BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/sexta_medical_backup_*.sql.gz 2>/dev/null | wc -l | tr -d ' ')
log "Local backups remaining: ${BACKUP_COUNT}"

# =============================================================================
# External Backup (uncomment the option you want to use)
# =============================================================================

# --- Option 1: DigitalOcean Spaces ---
# if [ -n "$SPACES_BUCKET" ]; then
#     log "Uploading to DigitalOcean Spaces..."
#     # Requires: apt install s3cmd && s3cmd --configure
#     s3cmd put "$BACKUP_FILE_COMPRESSED" "s3://${SPACES_BUCKET}/backups/$(basename $BACKUP_FILE_COMPRESSED)" \
#         --host="${SPACES_ENDPOINT}" \
#         --host-bucket="%(bucket)s.${SPACES_ENDPOINT}"
#     log "✅ Uploaded to Spaces: s3://${SPACES_BUCKET}/backups/$(basename $BACKUP_FILE_COMPRESSED)"
# fi

# --- Option 2: AWS S3 ---
# if [ -n "$S3_BUCKET" ]; then
#     log "Uploading to AWS S3..."
#     # Requires: apt install awscli && aws configure
#     aws s3 cp "$BACKUP_FILE_COMPRESSED" "s3://${S3_BUCKET}/backups/$(basename $BACKUP_FILE_COMPRESSED)"
#     log "✅ Uploaded to S3: s3://${S3_BUCKET}/backups/$(basename $BACKUP_FILE_COMPRESSED)"
# fi

# --- Option 3: Remote Server via SCP ---
# if [ -n "$REMOTE_HOST" ]; then
#     log "Uploading to remote server..."
#     # Requires: SSH key authentication set up
#     scp "$BACKUP_FILE_COMPRESSED" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/"
#     log "✅ Uploaded to ${REMOTE_HOST}:${REMOTE_PATH}/$(basename $BACKUP_FILE_COMPRESSED)"
# fi

log "=============================================="
log "  Backup Complete!"
log "=============================================="
