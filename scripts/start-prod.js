'use strict';

/**
 * Cross-platform production start used for local verification of the built app
 * (`npm run start:prod`). Hosting platforms set NODE_ENV themselves, so they
 * simply run `npm start`.
 *
 *   npm run build          # build the React bundle
 *   npm run db:migrate     # create the SQLite file
 *   npm run start:prod     # one process serves API + SPA on :5000
 */
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const { start } = require('../server/src/server');

try {
  start();
} catch (error) {
  console.error('Failed to start in production mode:', error.message);
  process.exitCode = 1;
}
