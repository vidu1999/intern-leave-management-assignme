'use strict';

const fs = require('fs');
const path = require('path');
const config = require('./config');
const createApp = require('./app');
const { openDatabase } = require('../db');
const { runMigrations } = require('../db/migrate');

/**
 * Entry point for the REST API (and, when `client/dist` exists, the web app).
 * Ensures the SQLite file and schema exist before the HTTP port is opened so a
 * fresh clone or a brand new hosting instance only needs `npm start`.
 */
function start() {
  if (config.databaseFile !== ':memory:') {
    fs.mkdirSync(path.dirname(config.databaseFile), { recursive: true });
  }

  const db = openDatabase(config.databaseFile);
  runMigrations(db);
  db.close();

  const clientBuild = fs.existsSync(path.join(config.clientDist, 'index.html'));
  const app = createApp();

  const server = app.listen(config.port, config.host, () => {
    const shown = config.host === '0.0.0.0' ? 'localhost' : config.host;
    console.log(`LeaveManager listening on http://${shown}:${config.port}`);
    console.log(`Environment : ${config.env}`);
    console.log(`Database    : ${config.databaseFile}`);
    console.log(
      clientBuild
        ? `Web app     : served from ${config.clientDist}`
        : 'Web app     : not built (run "npm run build" in client/ - API only for now)',
    );
  });

  const shutdown = (signal) => {
    console.log(`\n${signal} received - closing HTTP server.`);
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  return server;
}

if (require.main === module) {
  try {
    start();
  } catch (error) {
    console.error('Failed to start the API:', error.message);
    process.exitCode = 1;
  }
}

module.exports = { start };
