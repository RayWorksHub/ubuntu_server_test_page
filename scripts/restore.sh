#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 || "${CONFIRM_RESTORE:-}" != "YES_REPLACE_GANZPORTALOK_DATABASE" ]]; then
  echo "Használat: CONFIRM_RESTORE=YES_REPLACE_GANZPORTALOK_DATABASE $0 backups/fajl.sql.gz" >&2
  exit 2
fi

backup_file="$(realpath "$1")"
[[ -f "$backup_file" ]] || { echo "A mentés nem található." >&2; exit 2; }
PROJECT_DIR="${PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
cd "$PROJECT_DIR"
set -a
source .env
set +a
gunzip -c "$backup_file" | docker compose exec -T db psql -v ON_ERROR_STOP=1 -U "${POSTGRES_USER}" -d "${POSTGRES_DB}"
echo "A visszaállítás befejeződött."
