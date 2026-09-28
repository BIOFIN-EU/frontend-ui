# Targets:
#   dev         - next dev with hot reload (used by the local docker-compose.yml)
#   production  - next build + standalone server (what CI publishes as :latest)
#
#   docker build --target dev -t frontend-ui:dev .
#   docker build --target production --build-arg NEXT_PUBLIC_API_BASE_URL=https://... -t frontend-ui .

# ── development ────────────────────────────────────────────────────────────────
FROM node:20-alpine AS dev
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

EXPOSE 3000
ENV NODE_ENV=development
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "3000"]

# ── builder ────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# NEXT_PUBLIC_* values are inlined into the client bundle by `next build`, so
# the API URL is fixed per image and must be supplied here, not at runtime.
ARG NEXT_PUBLIC_API_BASE_URL
RUN test -n "$NEXT_PUBLIC_API_BASE_URL" || (echo "NEXT_PUBLIC_API_BASE_URL build arg is required" && exit 1)
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ── production ─────────────────────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

# Standalone output (next.config.mjs `output: "standalone"`) bundles the server
# and only the node_modules it needs; static assets are copied alongside it.
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nextjs /app/public ./public

USER nextjs

EXPOSE 3000
CMD ["node", "server.js"]
