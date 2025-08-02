#!/bin/bash

# NegotiationMaster Database Backup Script
# Automated backup with versioning and cleanup

set -e

# Configuration
DB_NAME="negotiation_master"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
MAX_BACKUPS=30  # Keep 30 days of backups

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/negotiation_master_$TIMESTAMP.sql"
SCHEMA_FILE="$BACKUP_DIR/schema_$TIMESTAMP.sql"
DATA_FILE="$BACKUP_DIR/data_$TIMESTAMP.sql"

echo "Starting database backup..."
echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo "User: $DB_USER"
echo "Backup directory: $BACKUP_DIR"
echo "Timestamp: $TIMESTAMP"
echo ""

# Full database backup
echo "Creating full database backup..."
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
  --verbose --clean --if-exists --create \
  --format=plain --encoding=UTF8 \
  > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✓ Full backup completed: $BACKUP_FILE"
else
    echo "✗ Full backup failed"
    exit 1
fi

# Schema-only backup
echo "Creating schema-only backup..."
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
  --schema-only --verbose --clean --if-exists \
  --format=plain --encoding=UTF8 \
  > "$SCHEMA_FILE"

if [ $? -eq 0 ]; then
    echo "✓ Schema backup completed: $SCHEMA_FILE"
else
    echo "✗ Schema backup failed"
    exit 1
fi

# Data-only backup
echo "Creating data-only backup..."
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
  --data-only --verbose --disable-triggers \
  --format=plain --encoding=UTF8 \
  > "$DATA_FILE"

if [ $? -eq 0 ]; then
    echo "✓ Data backup completed: $DATA_FILE"
else
    echo "✗ Data backup failed"
    exit 1
fi

# Compress backups
echo "Compressing backups..."
gzip "$BACKUP_FILE" "$SCHEMA_FILE" "$DATA_FILE"

if [ $? -eq 0 ]; then
    echo "✓ Compression completed"
else
    echo "✗ Compression failed"
    exit 1
fi

# Generate backup metadata
METADATA_FILE="$BACKUP_DIR/backup_$TIMESTAMP.json"
cat > "$METADATA_FILE" << EOF
{
  "timestamp": "$TIMESTAMP",
  "date": "$(date -Iseconds)",
  "database": "$DB_NAME",
  "host": "$DB_HOST",
  "port": "$DB_PORT",
  "user": "$DB_USER",
  "files": {
    "full": "negotiation_master_$TIMESTAMP.sql.gz",
    "schema": "schema_$TIMESTAMP.sql.gz",
    "data": "data_$TIMESTAMP.sql.gz"
  },
  "sizes": {
    "full": "$(du -h $BACKUP_FILE.gz | cut -f1)",
    "schema": "$(du -h $SCHEMA_FILE.gz | cut -f1)",
    "data": "$(du -h $DATA_FILE.gz | cut -f1)"
  },
  "git_commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "migration_version": "$(cd backend && npx knex migrate:currentVersion 2>/dev/null || echo 'unknown')"
}
EOF

echo "✓ Metadata created: $METADATA_FILE"

# Cleanup old backups
echo "Cleaning up old backups (keeping $MAX_BACKUPS most recent)..."
find "$BACKUP_DIR" -name "negotiation_master_*.sql.gz" -type f | \
  sort -r | tail -n +$((MAX_BACKUPS + 1)) | xargs -r rm -f

find "$BACKUP_DIR" -name "schema_*.sql.gz" -type f | \
  sort -r | tail -n +$((MAX_BACKUPS + 1)) | xargs -r rm -f

find "$BACKUP_DIR" -name "data_*.sql.gz" -type f | \
  sort -r | tail -n +$((MAX_BACKUPS + 1)) | xargs -r rm -f

find "$BACKUP_DIR" -name "backup_*.json" -type f | \
  sort -r | tail -n +$((MAX_BACKUPS + 1)) | xargs -r rm -f

echo "✓ Cleanup completed"

# Display backup summary
echo ""
echo "=== BACKUP SUMMARY ==="
echo "Timestamp: $TIMESTAMP"
echo "Files created:"
echo "  - negotiation_master_$TIMESTAMP.sql.gz ($(du -h $BACKUP_FILE.gz | cut -f1))"
echo "  - schema_$TIMESTAMP.sql.gz ($(du -h $SCHEMA_FILE.gz | cut -f1))"
echo "  - data_$TIMESTAMP.sql.gz ($(du -h $DATA_FILE.gz | cut -f1))"
echo "  - backup_$TIMESTAMP.json"
echo ""
echo "Total backups in directory: $(find "$BACKUP_DIR" -name "negotiation_master_*.sql.gz" | wc -l)"
echo "Backup location: $BACKUP_DIR"
echo "✓ Backup completed successfully"

# Optional: Upload to cloud storage
if [ -n "$AWS_S3_BUCKET" ]; then
    echo "Uploading to S3 bucket: $AWS_S3_BUCKET"
    aws s3 cp "$BACKUP_FILE.gz" "s3://$AWS_S3_BUCKET/backups/"
    aws s3 cp "$SCHEMA_FILE.gz" "s3://$AWS_S3_BUCKET/backups/"
    aws s3 cp "$DATA_FILE.gz" "s3://$AWS_S3_BUCKET/backups/"
    aws s3 cp "$METADATA_FILE" "s3://$AWS_S3_BUCKET/backups/"
    echo "✓ S3 upload completed"
fi

echo "Backup script completed at $(date)"
exit 0