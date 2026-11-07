FROM node:24-bookworm-slim AS deps

WORKDIR /app
RUN npm install --global pnpm@11.17.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Dipakai service migrate di Compose; node-pg-migrate ada di devDependencies.
FROM deps AS migrate

COPY src/db/migrations ./src/db/migrations
CMD ["pnpm", "run", "db:migrate"]

FROM deps AS build

COPY . .
RUN pnpm run build
RUN pnpm prune --prod --ignore-scripts

FROM node:24-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY --from=build --chown=node:node /app/build ./build
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/package.json ./package.json

USER node
EXPOSE 3000
CMD ["node", "build"]
