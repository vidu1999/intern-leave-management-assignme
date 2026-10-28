#!/usr/bin/env node
/**
 * One-shot project setup, safe to re-run:
 *
 *   npm run setup      (from the repository root)
 *
 * 1. installs backend and frontend dependencies
 * 2. creates server/.env and client/.env from the checked-in examples (never
 *    overwriting an existing file, so local settings survive)
 * 3. applies the SQL migrations that create the SQLite database
 * 4. seeds clearly-labelled demonstration data
 *
 * Plain Node, no extra dependencies, works on Windows 11, macOS and Linux.
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const isWindows = process.platform === 'win32';

function log(message) {
  process.stdout.write(`\x1b[36m[setup]\x1b[0m ${message}\n`);
}

function fail(message) {
  process.stderr.write(`\x1b[31m[setup]\x1b[0m ${message}\n`);
}

function npm(args, cwd = root) {
  log(`npm ${args.join(' ')}  (${path.relative(root, cwd) || '.'})`);
  const result = spawnSync(isWindows ? 'npm.cmd' : 'npm', args, {
    cwd,
    stdio: 'inherit',
    shell: true,
  });
  if (result.status !== 0) {
    fail(`command failed with exit code ${result.status ?? 'unknown'}: npm ${args.join(' ')}`);
    process.exit(result.status || 1);
  }
}

function copyEnvExample(folder) {
  const target = path.join(root, folder, '.env');
  const example = path.join(root, folder, '.env.example');
  if (!fs.existsSync(example)) return;
  if (fs.existsSync(target)) {
    log(`${folder}/.env already exists - left untouched`);
    return;
  }
  fs.copyFileSync(example, target);
  log(`created ${folder}/.env from ${folder}/.env.example`);
}

log('installing backend dependencies (better-sqlite3 may compile on first run)');
npm(['install', '--no-audit', '--no-fund'], path.join(root, 'server'));

log('installing frontend dependencies');
npm(['install', '--no-audit', '--no-fund'], path.join(root, 'client'));

copyEnvExample('server');
copyEnvExample('client');

log('applying database migrations');
npm(['run', 'db:migrate'], path.join(root, 'server'));

log('seeding demonstration data (skipped automatically if the database is not empty)');
npm(['run', 'db:seed'], path.join(root, 'server'));

log('done. Start everything with:');
log('    npm run dev');
log('then open http://localhost:5173');
