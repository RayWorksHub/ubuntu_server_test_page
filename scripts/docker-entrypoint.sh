#!/usr/bin/env sh
set -eu

./node_modules/.bin/prisma migrate deploy
exec ./node_modules/.bin/next start -H 0.0.0.0 -p 3000
