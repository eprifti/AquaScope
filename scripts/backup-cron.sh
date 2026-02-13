#!/bin/sh
# AquaScope Automated Backup Script (runs inside backup-cron container)
#
# Creates timestamped tar.gz archives with:
#   1. PostgreSQL dump
#   2. InfluxDB backup
#   3. All uploaded files
#   4. Manifest with record counts
#
# Applies retention policy: deletes backups older than BACKUP_RETENTION_DAYS.
# Designed to run via crond inside the docker:24-cli container.

set -e

BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y-%m-%d-%H%M%S)
BACKUP_NAME="aquascope-backup-$TIMESTAMP"
TEMP_DIR="$BACKUP_DIR/$BACKUP_NAME"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"

echo "=== AquaScope Automated Backup ==="
echo "Timestamp: $TIMESTAMP"
echo ""

mkdir -p "$TEMP_DIR"

# 1. PostgreSQL dump
echo "[1/5] Dumping PostgreSQL..."
docker exec aquascope-postgres pg_dump \
  -U "${POSTGRES_USER:-reeflab}" \
  -d "${POSTGRES_DB:-reeflab}" \
  > "$TEMP_DIR/postgres.sql" 2>/dev/null
PG_SIZE=$(wc -c < "$TEMP_DIR/postgres.sql" | tr -d ' ')
echo "      Done ($PG_SIZE bytes)"

# 2. InfluxDB backup
echo "[2/5] Backing up InfluxDB..."
docker exec aquascope-influxdb rm -rf /tmp/influx-backup 2>/dev/null || true
docker exec aquascope-influxdb influx backup /tmp/influx-backup \
  --org "${INFLUXDB_ORG:-reeflab}" \
  --token "${INFLUXDB_ADMIN_TOKEN:-my-super-secret-admin-token}" \
  2>&1 | sed 's/^/      /'
docker cp aquascope-influxdb:/tmp/influx-backup "$TEMP_DIR/influxdb"
docker exec aquascope-influxdb rm -rf /tmp/influx-backup
INFLUX_FILES=$(find "$TEMP_DIR/influxdb" -type f | wc -l | tr -d ' ')
echo "      Done ($INFLUX_FILES files)"

# 3. Upload files (from read-only bind mount)
echo "[3/5] Copying upload files..."
if [ -d /uploads ] && [ "$(ls -A /uploads 2>/dev/null)" ]; then
  cp -R /uploads "$TEMP_DIR/uploads"
else
  mkdir -p "$TEMP_DIR/uploads"
fi
UPLOAD_COUNT=$(find "$TEMP_DIR/uploads" -type f | wc -l | tr -d ' ')
echo "      Done ($UPLOAD_COUNT files)"

# 4. Generate manifest
echo "[4/5] Generating manifest..."
PG_USERS=$(docker exec aquascope-postgres psql -U "${POSTGRES_USER:-reeflab}" -d "${POSTGRES_DB:-reeflab}" -t -c "SELECT count(*) FROM users;" 2>/dev/null | tr -d ' ' || echo "0")
PG_TANKS=$(docker exec aquascope-postgres psql -U "${POSTGRES_USER:-reeflab}" -d "${POSTGRES_DB:-reeflab}" -t -c "SELECT count(*) FROM tanks;" 2>/dev/null | tr -d ' ' || echo "0")
PG_PHOTOS=$(docker exec aquascope-postgres psql -U "${POSTGRES_USER:-reeflab}" -d "${POSTGRES_DB:-reeflab}" -t -c "SELECT count(*) FROM photos;" 2>/dev/null | tr -d ' ' || echo "0")
PG_NOTES=$(docker exec aquascope-postgres psql -U "${POSTGRES_USER:-reeflab}" -d "${POSTGRES_DB:-reeflab}" -t -c "SELECT count(*) FROM notes;" 2>/dev/null | tr -d ' ' || echo "0")
PG_LIVESTOCK=$(docker exec aquascope-postgres psql -U "${POSTGRES_USER:-reeflab}" -d "${POSTGRES_DB:-reeflab}" -t -c "SELECT count(*) FROM livestock;" 2>/dev/null | tr -d ' ' || echo "0")

cat > "$TEMP_DIR/manifest.json" << EOF
{
  "app": "AquaScope",
  "backup_date": "$TIMESTAMP",
  "backup_type": "automated",
  "postgres_user": "${POSTGRES_USER:-reeflab}",
  "postgres_db": "${POSTGRES_DB:-reeflab}",
  "influxdb_org": "${INFLUXDB_ORG:-reeflab}",
  "counts": {
    "users": $PG_USERS,
    "tanks": $PG_TANKS,
    "photos": $PG_PHOTOS,
    "notes": $PG_NOTES,
    "livestock": $PG_LIVESTOCK,
    "upload_files": $UPLOAD_COUNT
  }
}
EOF

# Compress
echo "      Compressing..."
cd "$BACKUP_DIR"
tar czf "$BACKUP_NAME.tar.gz" "$BACKUP_NAME"
rm -rf "$TEMP_DIR"

ARCHIVE_SIZE=$(du -sh "$BACKUP_DIR/$BACKUP_NAME.tar.gz" | cut -f1)
echo "      Archive: $BACKUP_NAME.tar.gz ($ARCHIVE_SIZE)"

# 5. Retention policy — delete old backups
echo "[5/5] Applying retention policy (keep ${RETENTION_DAYS} days)..."
if [ "$RETENTION_DAYS" -gt 0 ] 2>/dev/null; then
  DELETED=0
  for f in "$BACKUP_DIR"/aquascope-backup-*.tar.gz; do
    [ -f "$f" ] || continue
    # Skip the backup we just created
    [ "$f" = "$BACKUP_DIR/$BACKUP_NAME.tar.gz" ] && continue
    # Check file age
    FILE_AGE_DAYS=$(( ($(date +%s) - $(stat -c %Y "$f" 2>/dev/null || date -r "$f" +%s 2>/dev/null || echo 0)) / 86400 ))
    if [ "$FILE_AGE_DAYS" -gt "$RETENTION_DAYS" ]; then
      rm -f "$f"
      DELETED=$((DELETED + 1))
      echo "      Deleted: $(basename "$f") (${FILE_AGE_DAYS} days old)"
    fi
  done
  if [ "$DELETED" -eq 0 ]; then
    echo "      No old backups to clean up"
  else
    echo "      Cleaned up $DELETED old backup(s)"
  fi
else
  echo "      Retention disabled (BACKUP_RETENTION_DAYS=0)"
fi

TOTAL_BACKUPS=$(ls -1 "$BACKUP_DIR"/aquascope-backup-*.tar.gz 2>/dev/null | wc -l | tr -d ' ')
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)

echo ""
echo "=== Backup Complete ==="
echo "Archive:   $BACKUP_NAME.tar.gz ($ARCHIVE_SIZE)"
echo "Contents:  $PG_USERS users, $PG_TANKS tanks, $UPLOAD_COUNT files"
echo "Retention: $TOTAL_BACKUPS backups total ($TOTAL_SIZE)"
