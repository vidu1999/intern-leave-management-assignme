'use strict';

const path = require('path');
const dotenv = require('dotenv');

const serverRoot = path.resolve(__dirname, '..');

// Load `server/.env` when present. Tests may inject DATABASE_FILE before this
// module is required, so an already defined value always wins.
dotenv.config({ path: path.join(serverRoot, '.env') });

function resolveDatabaseFile(value) {
  if (!value) return path.join(serverRoot, 'data', 'leave_manager.db');
  if (value === ':memory:') return value;
  return path.isAbsolute(value) ? value : path.resolve(serverRoot, value);
}

function resolveFromServerRoot(value) {
  return path.isAbsolute(value) ? value : path.resolve(serverRoot, value);
}

const nodeEnv = process.env.NODE_ENV || 'development';

const config = {
  env: nodeEnv,
  isProduction: nodeEnv === 'production',
  isTest: nodeEnv === 'test',
  port: Number.parseInt(process.env.PORT || '5000', 10),
  // 0.0.0.0 is required by container hosts (Render, Railway, Fly, Docker) so the
  // platform's router can reach the process. Local dev can override with HOST.
  host: process.env.HOST || '0.0.0.0',
  serverRoot,
  databaseFile: resolveDatabaseFile(process.env.DATABASE_FILE),
  clientOrigins: (process.env.CLIENT_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  jsonBodyLimit: process.env.JSON_BODY_LIMIT || '100kb',
  // Built React bundle. When it exists the API also serves the SPA, which makes
  // the whole application deployable as ONE service on ONE public URL.
  clientDist: resolveFromServerRoot(process.env.CLIENT_DIST || path.join('..', 'client', 'dist')),
};

module.exports = config;
