# ---- Stage 1: Build ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Copy prisma schema trước để generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy data folder chứa file CSV
COPY data ./data

# Copy toàn bộ source rồi build
COPY . .
RUN npm run build

# Compile seed script riêng để dùng trong production (không cần ts-node)
RUN npx tsc prisma/seed.ts prisma/verify.ts \
    --outDir /app/dist-seed \
    --module commonjs \
    --target es2020 \
    --esModuleInterop \
    --skipLibCheck \
    --resolveJsonModule || true


# ---- Stage 2: Production ----
FROM node:20-alpine AS production
WORKDIR /app

# Chỉ cài production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy compiled output
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-seed ./dist-seed

# Copy data folder chứa file CSV sang production
COPY --from=builder /app/data ./data

# Copy prisma: generated client + schema + migrations + config
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts

EXPOSE 8000

# Chạy migrate rồi mới start server
CMD ["sh", "-c", "DATABASE_URL=$DATABASE_URL npx prisma migrate deploy && node dist/main"]
