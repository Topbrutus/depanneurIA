FROM node:22-alpine AS builder
WORKDIR /app

RUN corepack enable

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json tsconfig.base.json ./
COPY apps/phone-gateway/package.json ./apps/phone-gateway/package.json
COPY apps/phone-gateway/tsconfig.json ./apps/phone-gateway/tsconfig.json
COPY apps/phone-gateway/src ./apps/phone-gateway/src

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @depaneuria/phone-gateway build

FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY --from=builder /app/apps/phone-gateway/dist ./dist

EXPOSE 8080

CMD ["node", "dist/index.js"]
