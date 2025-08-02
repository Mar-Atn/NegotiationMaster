#!/bin/bash

# Database Schema Backup and Versioning Script
# Usage: ./scripts/schema-backup.sh [backup|restore|diff|version]

set -e

# Configuration
BACKUP_DIR="./database/backups"
SCHEMA_DIR="./database/schema-versions"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATABASE_URL=${DATABASE_URL:-"postgresql://postgres:password@localhost:5432/negotiation_master"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create directories if they don't exist
mkdir -p "$BACKUP_DIR"
mkdir -p "$SCHEMA_DIR"

show_help() {
    echo "Database Schema Management Tool"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  backup     Create a full database backup"
    echo "  schema     Export current schema structure"
    echo "  restore    Restore from a backup file"
    echo "  diff       Compare current schema with latest backup"
    echo "  version    Create a versioned schema snapshot"
    echo "  list       List available backups and versions"
    echo "  help       Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 backup                    # Create timestamped backup"
    echo "  $0 restore backup_file.sql   # Restore from specific backup"
    echo "  $0 version v1.2.0           # Create named schema version"
    echo ""
}

create_backup() {
    local backup_file="$BACKUP_DIR/full_backup_$TIMESTAMP.sql"
    
    echo -e "${YELLOW}🗄️  Creating full database backup...${NC}"
    
    pg_dump "$DATABASE_URL" \
        --verbose \
        --no-owner \
        --no-privileges \
        > "$backup_file"
    
    # Compress the backup
    gzip "$backup_file"
    backup_file="${backup_file}.gz"
    
    echo -e "${GREEN}✅ Backup created: $backup_file${NC}"
    echo -e "${BLUE}📊 Backup size: $(du -h "$backup_file" | cut -f1)${NC}"
}

export_schema() {
    local schema_file="$SCHEMA_DIR/schema_$TIMESTAMP.sql"
    
    echo -e "${YELLOW}📋 Exporting database schema...${NC}"
    
    pg_dump "$DATABASE_URL" \
        --schema-only \
        --verbose \
        --no-owner \
        --no-privileges \
        > "$schema_file"
    
    echo -e "${GREEN}✅ Schema exported: $schema_file${NC}"
}

create_version() {
    local version_name=${1:-"v$(date +%Y.%m.%d)"}
    local version_dir="$SCHEMA_DIR/$version_name"
    
    mkdir -p "$version_dir"
    
    echo -e "${YELLOW}🏷️  Creating schema version: $version_name${NC}"
    
    # Export schema structure
    pg_dump "$DATABASE_URL" \
        --schema-only \
        --no-owner \
        --no-privileges \
        > "$version_dir/schema.sql"
    
    # Export data for seed tables
    pg_dump "$DATABASE_URL" \
        --data-only \
        --table=scenarios \
        --no-owner \
        --no-privileges \
        > "$version_dir/seed_data.sql"
    
    # Create migration info
    cat > "$version_dir/info.json" << EOF
{
  "version": "$version_name",
  "created_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "database_version": "$(psql "$DATABASE_URL" -t -c "SELECT version();" | xargs)",
  "migration_count": $(ls -1 backend/src/database/migrations/*.js 2>/dev/null | wc -l),
  "tables": $(psql "$DATABASE_URL" -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';"),
  "description": "Schema version $version_name"
}
EOF
    
    # Create README
    cat > "$version_dir/README.md" << EOF
# Schema Version $version_name

Created: $(date)
Database: $(basename "$DATABASE_URL")

## Files

- \`schema.sql\`: Complete database schema structure
- \`seed_data.sql\`: Seed data for core tables
- \`info.json\`: Version metadata

## Restore Instructions

\`\`\`bash
# Restore schema structure
psql \$DATABASE_URL < schema.sql

# Restore seed data
psql \$DATABASE_URL < seed_data.sql
\`\`\`

## Changes in This Version

[Manually document changes here]
EOF
    
    echo -e "${GREEN}✅ Version created: $version_dir${NC}"
    echo -e "${BLUE}📁 Files: schema.sql, seed_data.sql, info.json, README.md${NC}"
}

restore_backup() {
    local backup_file=$1
    
    if [ -z "$backup_file" ]; then
        echo -e "${RED}❌ Error: Backup file required${NC}"
        echo "Usage: $0 restore <backup_file>"
        list_backups
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        echo -e "${RED}❌ Error: Backup file not found: $backup_file${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}⚠️  WARNING: This will overwrite the current database!${NC}"
    read -p "Continue? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Restore cancelled${NC}"
        exit 0
    fi
    
    echo -e "${YELLOW}🔄 Restoring database from $backup_file...${NC}"
    
    # Handle compressed files
    if [[ "$backup_file" == *.gz ]]; then
        gunzip -c "$backup_file" | psql "$DATABASE_URL"
    else
        psql "$DATABASE_URL" < "$backup_file"
    fi
    
    echo -e "${GREEN}✅ Database restored successfully${NC}"
}

compare_schema() {
    local latest_schema=$(ls -t "$SCHEMA_DIR"/schema_*.sql 2>/dev/null | head -1)
    
    if [ -z "$latest_schema" ]; then
        echo -e "${YELLOW}⚠️  No previous schema found. Creating first schema snapshot...${NC}"
        export_schema
        return
    fi
    
    echo -e "${YELLOW}🔍 Comparing current schema with latest backup...${NC}"
    
    # Export current schema to temp file
    local temp_schema="/tmp/current_schema_$TIMESTAMP.sql"
    pg_dump "$DATABASE_URL" \
        --schema-only \
        --no-owner \
        --no-privileges \
        > "$temp_schema"
    
    # Compare schemas
    if diff -u "$latest_schema" "$temp_schema" > /tmp/schema_diff.txt; then
        echo -e "${GREEN}✅ No schema changes detected${NC}"
    else
        echo -e "${BLUE}📝 Schema differences found:${NC}"
        cat /tmp/schema_diff.txt
        
        read -p "Create new schema version? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            export_schema
        fi
    fi
    
    # Cleanup
    rm -f "$temp_schema" /tmp/schema_diff.txt
}

list_backups() {
    echo -e "${BLUE}📋 Available Backups:${NC}"
    echo "===================="
    
    if ls "$BACKUP_DIR"/*.sql* >/dev/null 2>&1; then
        for backup in "$BACKUP_DIR"/*.sql*; do
            local size=$(du -h "$backup" | cut -f1)
            local date=$(stat -c %y "$backup" | cut -d' ' -f1)
            echo "$(basename "$backup") - $size - $date"
        done
    else
        echo "No backups found"
    fi
    
    echo ""
    echo -e "${BLUE}📋 Schema Versions:${NC}"
    echo "==================="
    
    if ls "$SCHEMA_DIR"/v* >/dev/null 2>&1; then
        for version in "$SCHEMA_DIR"/v*; do
            if [ -d "$version" ]; then
                local version_name=$(basename "$version")
                local date=""
                if [ -f "$version/info.json" ]; then
                    date=$(grep created_at "$version/info.json" | cut -d'"' -f4)
                fi
                echo "$version_name - $date"
            fi
        done
    else
        echo "No schema versions found"
    fi
}

# Main command handling
case "${1:-help}" in
    backup)
        create_backup
        ;;
    schema)
        export_schema
        ;;
    restore)
        restore_backup "$2"
        ;;
    diff)
        compare_schema
        ;;
    version)
        create_version "$2"
        ;;
    list)
        list_backups
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        show_help
        exit 1
        ;;
esac