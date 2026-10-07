FROM node:22-bookworm-slim AS deps
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates openssl && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM deps AS builder
WORKDIR /app
COPY . .
RUN npm run prisma:generate
RUN DATABASE_URL="postgresql://build:build@127.0.0.1:5432/build" APP_URL="https://ganzportalok.hu" APP_SECRET="build-only-secret-build-only-secret-1234" SMTP_HOST="localhost" SMTP_PORT="465" SMTP_SECURE="true" SMTP_USER="build" SMTP_PASSWORD="build" SMTP_FROM="administration@ganzportalok.hu" npm run build

FROM builder AS test
RUN npm run typecheck && npm test

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates openssl && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --chmod=755 scripts/docker-entrypoint.sh /usr/local/bin/ganz-entrypoint
RUN npm prune --omit=dev --no-audit --no-fund && chown -R node:node /app
USER node
EXPOSE 3000
ENTRYPOINT ["ganz-entrypoint"]
