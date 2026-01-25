#!/bin/bash
# =============================================================================
# Download Latest Backup from Droplet to Local Machine
# =============================================================================
# Run this from your LOCAL computer to fetch the latest backup from your droplet
#
# Usage: ./download_backup.sh <DROPLET_IP>
# Example: ./download_backup.sh 143.198.xxx.xxx
# =============================================================================

set -e

# Configuration
LOCAL_BACKUP_DIR="$(dirname "$0")/backups"
REMOTE_BACKUP_DIR="/root/6MEDICAL/backups"

if [ -z "$1" ]; then
    echo "=============================================="
    echo "  Download Backup from Droplet"
    echo "=============================================="
    echo ""
    echo "Usage: $0 <DROPLET_IP>"
    echo "Example: $0 143.198.123.45"
    echo ""
    exit 1
fi

DROPLET_IP="$1"

echo "=============================================="
echo "  Downloading Backup from Droplet"
echo "=============================================="
echo ""
echo "Droplet: root@${DROPLET_IP}"
echo "Remote dir: ${REMOTE_BACKUP_DIR}"
echo "Local dir: ${LOCAL_BACKUP_DIR}"
echo ""

# Create local backup directory
mkdir -p "$LOCAL_BACKUP_DIR"

# Get list of remote backups
echo "Checking available backups on droplet..."
LATEST_BACKUP=$(ssh root@${DROPLET_IP} "ls -t ${REMOTE_BACKUP_DIR}/sexta_medical_backup_*.sql.gz 2>/dev/null | head -1")

if [ -z "$LATEST_BACKUP" ]; then
    echo "❌ No backups found on droplet!"
    echo ""
    echo "Run this on your droplet first:"
    echo "  cd /root/6MEDICAL && ./6Back/auto_backup.sh"
    exit 1
fi

BACKUP_NAME=$(basename "$LATEST_BACKUP")
echo "Latest backup: $BACKUP_NAME"
echo ""

# Check if we already have this backup
if [ -f "${LOCAL_BACKUP_DIR}/${BACKUP_NAME}" ]; then
    echo "⚠️  This backup already exists locally!"
    read -p "Download anyway? (y/n): " confirm
    if [ "$confirm" != "y" ]; then
        echo "Download cancelled."
        exit 0
    fi
fi

# Download the backup
echo "Downloading..."
scp "root@${DROPLET_IP}:${LATEST_BACKUP}" "${LOCAL_BACKUP_DIR}/"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Backup downloaded successfully!"
    echo "   File: ${LOCAL_BACKUP_DIR}/${BACKUP_NAME}"
    echo "   Size: $(du -h "${LOCAL_BACKUP_DIR}/${BACKUP_NAME}" | cut -f1)"
    echo ""
    echo "To restore this backup locally:"
    echo "   gunzip ${LOCAL_BACKUP_DIR}/${BACKUP_NAME}"
    echo "   ./6Back/restore_database.sh backups/${BACKUP_NAME%.gz}"
else
    echo "❌ Download failed!"
    exit 1
fi
