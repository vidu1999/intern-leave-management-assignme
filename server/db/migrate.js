'use strict';

/**
 * Reproducible database initialisation.
 *
 * Every `.sql` file inside `db/migrations` is applied exactly once, in file
 * name order, and recorded in the `_migrations` table. Running the script
 * again is a no-op, which makes it safe to call from setup scripts and tests.
 *
 *   npm run db:migrate        (from the server/ directory)
 */
const fs = require('fs');
const path = require('path');
const config = require('../src/config');
const { openDatabase } = require('./index');

const migrationsDir = path.join(__dirname, 'migrations');

function runMigrations(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL
    );
  `);

  const applied = new Set(db.prepare('SELECT name FROM _migrations').all().map((row) => row.name));
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  const newlyApplied = [];
  for (const file of files) {
    if (applied.has(file)) continue;

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    const apply = db.transaction(() => {
      db.exec(sql);
      db.prepare('INSERT INTO _migrations (name, applied_at) VALUES (?, ?)').run(file, new Date().toISOString());
    });
    apply();
    newlyApplied.push(file);
  }

  return { applied: newlyApplied, total: files.length };
}

function main() {
  const db = openDatabase();
  try {
    const result = runMigrations(db);
    if (result.applied.length === 0) {
      console.log(`Database is up to date (${result.total} migration(s) already applied).`);
    } else {
      console.log(`Applied ${result.applied.length} migration(s): ${result.applied.join(', ')}`);
    }
    console.log(`Database file: ${config.databaseFile}`);
  } finally {
    db.close();
  }
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error('Database migration failed:', error.message);
    process.exitCode = 1;
  }
}

module.exports = { runMigrations };
