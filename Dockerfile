# LeaveManager - build & run the whole app as ONE service.
# The Express API serves both /api/* and the compiled React bundle.
FROM node:22-bookworm-slim

ENV NODE_ENV=production \
    PORT=5000 \
    HOST=0.0.0.0 \
    DATABASE_FILE=/app/data/leave_manager.db

WORKDIR /app

# 1) Install server dependencies (better-sqlite3 ships prebuilt binaries for
#    linux-x64/arm64; no compiler needed).
COPY server/package.json server/package-lock.json ./server/
RUN npm ci --omit=dev --prefix server

# 2) Install client dependencies and build the static bundle.
COPY client/package.json client/package-lock.json ./client/
RUN npm ci --prefix client

COPY . .

RUN npm run build --prefix client && npm cache clean --force

# SQLite lives here - mount a volume on this path to keep data across deploys.
RUN mkdir -p /app/data && chown -R node:node /app

USER node
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Migrations run automatically on start-up (see server/src/server.js).
CMD ["node", "server/src/server.js"]
