# ---- Base ----
FROM node:22-alpine AS base
WORKDIR /app

# ---- Dependencies ----
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---- Build ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build -- --webpack

# ---- Production ----
FROM base AS runner

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN apk add --no-cache wget \
    && addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Static assets — must be world-readable for Next.js
COPY --from=builder /app/public ./public

# Standalone server + its minimal node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Pre-rendered static pages / chunks
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
