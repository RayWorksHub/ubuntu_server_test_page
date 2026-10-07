#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
BACKUP_DIR="${BACKUP_DIR:-${PROJECT_DIR}/backups}"
mkdir -p "$BACKUP_DIR"
cd "$PROJECT_DIR"

set -a
source .env
set +a

timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
target="${BACKUP_DIR}/ganzportalok-${timestamp}.sql.gz"
docker compose exec -T db pg_dump -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" --clean --if-exists | gzip -9 > "$target"
chmod 600 "$target"
find "$BACKUP_DIR" -type f -name 'ganzportalok-*.sql.gz' -mtime +14 -delete
echo "$target"
