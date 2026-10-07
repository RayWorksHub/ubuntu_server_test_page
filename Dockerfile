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
COPY --chown=node:node --from=builder /app/.next/standalone ./
COPY --chown=node:node --from=builder /app/.next/static ./.next/static
COPY --chown=node:node --from=builder /app/public ./public
COPY --chown=node:node --from=builder /app/prisma ./prisma
COPY --chown=node:node --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --chown=node:node --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --chmod=755 scripts/docker-entrypoint.sh /usr/local/bin/ganz-entrypoint
USER node
EXPOSE 3000
ENTRYPOINT ["ganz-entrypoint"]
