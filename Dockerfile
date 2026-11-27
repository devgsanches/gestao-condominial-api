# Dockerfile with Multi-Stage (builder and runner) Build

FROM node:24-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm@10.23.0

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm prisma generate

RUN pnpm build

FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN npm install -g pnpm@10.23.0

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --prod

# Copy compiled application
COPY --from=builder /app/dist ./dist

# Copy generated Prisma Client
COPY --from=builder /app/generated ./generated

# limitando as permissões - com usuário node
USER node

EXPOSE 3333

CMD ["node", "dist/src/infra/main.js"]