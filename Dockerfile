# Build from services/ directory:
#   docker build -f svc-shexmap/Dockerfile -t svc-shexmap .
#   docker build -f svc-shexmap/Dockerfile --target dev -t svc-shexmap:dev .

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
FROM dev AS builder
RUN npx tsc

# ── production ─────────────────────────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/dist         ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json         ./

EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]