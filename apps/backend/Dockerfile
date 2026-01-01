FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lock ./

# Copy all apps and packages for lockfile validation,
# regardless of them being used or not.
# TODO: Implement Turbo prune or wait for Bun's own solution.
COPY packages ./packages
COPY apps ./apps

RUN bun install --frozen-lockfile

WORKDIR /app/apps/backend

CMD ["bun", "run", "start"]
