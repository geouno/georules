FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lock ./
COPY packages ./packages
COPY apps/backend ./apps/backend

RUN bun install

WORKDIR /app/apps/backend

CMD ["bun", "run", "start"]
