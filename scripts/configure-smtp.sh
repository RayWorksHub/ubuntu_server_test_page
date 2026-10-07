#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-$HOME/services/ganzportalok}"
ENV_FILE="$PROJECT_DIR/.env"
[[ -f "$ENV_FILE" ]] || { echo "Hiányzik: $ENV_FILE" >&2; exit 2; }

read -r -s -p "Az administration@ganzportalok.hu SMTP-jelszava: " smtp_password
echo
if [[ ! "$smtp_password" =~ ^[A-Za-z0-9._@%+=:-]{12,128}$ ]]; then
  echo "A jelszó 12–128 karakter legyen, és csak biztonságosan kezelhető karaktereket tartalmazzon." >&2
  exit 2
fi

temporary="$(mktemp "$PROJECT_DIR/.env.smtp.XXXXXX")"
trap 'rm -f "$temporary"' EXIT
while IFS= read -r line || [[ -n "$line" ]]; do
  if [[ "$line" == SMTP_PASSWORD=* ]]; then
    printf 'SMTP_PASSWORD=%s\n' "$smtp_password"
  else
    printf '%s\n' "$line"
  fi
done < "$ENV_FILE" > "$temporary"
chmod 600 "$temporary"
mv "$temporary" "$ENV_FILE"
trap - EXIT
unset smtp_password

cd "$PROJECT_DIR"
docker compose up -d --force-recreate app
echo "Az SMTP-jelszó mentve; az alkalmazás újraindult."
