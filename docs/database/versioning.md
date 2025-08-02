# Database Schema Versioning

## Overview
This document describes the database schema versioning system for NegotiationMaster, including backup strategies, migration management, and automated schema drift detection.

## Schema Versioning Strategy

### Version Types

1. **Migration Versions**: Incremental changes via Knex.js migrations
2. **Schema Snapshots**: Point-in-time schema exports for comparison
3. **Release Versions**: Tagged schema states aligned with application releases
4. **Baseline Versions**: Known-good production schemas

### Directory Structure
```
database/
├── backups/                    # Automated database backups
│   ├── full_backup_20240129_143022.sql.gz
│   └── schema_20240129_143022.sql
├── schema-versions/            # Versioned schema snapshots
│   ├── v1.0.0/                # Release version
│   │   ├── schema.sql         # Schema structure
│   │   ├── seed_data.sql      # Core seed data
│   │   ├── info.json          # Version metadata
│   │   └── README.md          # Version documentation
│   ├── production/            # Current production baseline
│   └── staging/               # Staging environment baseline
└── migrations/                 # Knex.js migration files
    ├── 20250129000001_create_users_table.js
    └── ...
```

## Using the Schema Management Script

### Available Commands

```bash
# Create full database backup
./scripts/schema-backup.sh backup

# Export current schema structure only
./scripts/schema-backup.sh schema

# Create named version snapshot
./scripts/schema-backup.sh version v1.2.0

# Compare current schema with latest backup
./scripts/schema-backup.sh diff

# Restore from backup
./scripts/schema-backup.sh restore backup_file.sql.gz

# List all backups and versions
./scripts/schema-backup.sh list
```

### Creating Release Versions

When preparing a release:

```bash
# Create version snapshot
./scripts/schema-backup.sh version v1.2.0

# Document changes in the version README
cd database/schema-versions/v1.2.0
vim README.md
```

## Migration Management

### Creating Migrations

```bash
cd backend
npx knex migrate:make migration_name
```

### Running Migrations

```bash
# Development
npm run migrate

# Production (with backup)
./scripts/schema-backup.sh backup
npm run migrate
./scripts/schema-backup.sh version production-post-migration
```

### Migration Best Practices

1. **Always backup before migration**
2. **Test migrations on staging first**
3. **Make migrations reversible when possible**
4. **Document breaking changes**
5. **Create version snapshots after major migrations**

## Automated Backup System

### GitHub Actions Workflow

The automated backup system runs daily at 2 AM UTC and:

1. **Creates database backups**
2. **Uploads to S3 for long-term storage**
3. **Checks for schema drift**
4. **Creates GitHub issues for drift detection**
5. **Cleans up old local backups**

### Configuration

Set these GitHub secrets:

```bash
DATABASE_URL                    # Production database connection
AWS_ACCESS_KEY_ID              # S3 backup access
AWS_SECRET_ACCESS_KEY          # S3 backup secret
AWS_DEFAULT_REGION             # S3 region
S3_BACKUP_BUCKET              # S3 bucket for backups
```

### Manual Backup Trigger

Trigger manual backups via GitHub Actions:

1. Go to Actions → Database Backup
2. Click "Run workflow"
3. Select backup type (full/schema/version)

## Schema Drift Detection

### Automated Monitoring

The system automatically:

1. **Compares current schema** with baseline
2. **Detects unauthorized changes**
3. **Creates GitHub issues** for drift
4. **Provides diff output** for review

### Resolving Schema Drift

If drift is detected:

1. **Review the changes** in the GitHub issue
2. **Determine if changes are intentional**
3. **Update baseline** if changes are approved:
   ```bash
   ./scripts/schema-backup.sh version production
   ```
4. **Investigate** if changes are unauthorized

## Backup Retention Policy

### Local Backups
- **Daily backups**: Kept for 7 days
- **Schema snapshots**: Kept for 30 days
- **Version snapshots**: Kept indefinitely

### S3 Backups
- **Full backups**: Glacier Instant Retrieval (cost-effective)
- **Schema versions**: Standard storage for quick access
- **Retention**: Lifecycle policy moves to Deep Archive after 1 year

## Recovery Procedures

### Full Database Recovery

```bash
# 1. Stop application
systemctl stop negotiation-master

# 2. Restore from backup
./scripts/schema-backup.sh restore database/backups/full_backup_YYYYMMDD_HHMMSS.sql.gz

# 3. Verify restoration
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"

# 4. Start application
systemctl start negotiation-master
```

### Schema-Only Recovery

```bash
# Restore just the schema structure
psql $DATABASE_URL < database/schema-versions/v1.2.0/schema.sql

# Restore seed data
psql $DATABASE_URL < database/schema-versions/v1.2.0/seed_data.sql
```

## Monitoring and Alerts

### Health Checks

```bash
# Check backup system health
./scripts/schema-backup.sh list

# Verify S3 backup uploads
aws s3 ls s3://your-backup-bucket/backups/ --recursive | tail -10
```

### Alert Triggers

- **Backup failures** → GitHub issue + team notification
- **Schema drift** → GitHub issue for review
- **Storage quota** → Automated cleanup + notification

## Version Documentation

Each version snapshot includes:

```json
{
  "version": "v1.2.0",
  "created_at": "2024-01-29T14:30:22Z",
  "database_version": "PostgreSQL 15.5",
  "migration_count": 12,
  "tables": 8,
  "description": "Added voice integration tables"
}
```

### Changelog Template

```markdown
# Schema Version v1.2.0

## Changes in This Version

### Added
- `voice_recordings` table for audio storage
- `user_preferences` table for voice settings

### Modified  
- `negotiations` table: added `voice_enabled` column
- `users` table: added `voice_preference` column

### Removed
- Deprecated `temp_negotiations` table

## Migration Notes
- Requires ElevenLabs API configuration
- Voice files stored in S3 bucket
- Backward compatible with v1.1.x

## Rollback Procedure
If rollback is needed, run migrations in reverse order and restore from v1.1.0 snapshot.
```

## Best Practices

1. **Always test migrations** on staging first
2. **Create version snapshots** before major releases
3. **Document schema changes** in version READMEs
4. **Monitor for drift** regularly
5. **Keep backups secure** and encrypted
6. **Test recovery procedures** periodically
7. **Coordinate schema changes** with the team

## Troubleshooting

### Common Issues

1. **Migration Failures**:
   ```bash
   # Check migration status
   npx knex migrate:currentVersion
   
   # Rollback if needed
   npx knex migrate:rollback
   ```

2. **Backup Script Permissions**:
   ```bash
   chmod +x scripts/schema-backup.sh
   ```

3. **S3 Upload Failures**:
   ```bash
   # Test AWS credentials
   aws s3 ls s3://your-backup-bucket/
   ```

### Support

For backup and versioning issues:
1. Check GitHub Actions logs
2. Verify database connectivity
3. Confirm S3 credentials and permissions
4. Create issue with error details