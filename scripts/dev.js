#!/usr/bin/env node
/**
 * One command that starts the whole application:
 *
 *   npm run dev      (from the repository root)
 *
 * Why this exists: the API and the web app are two processes. Starting only the
 * client produces the exact failure "The API is not reachable" even though
 * nothing is broken. This script starts the API first, waits until it answers
 * /api/health, then starts Vite, and shuts both down together on Ctrl+C so no
 * orphan process keeps port 5000 or 5173 busy.
 *
 * No extra dependencies: plain Node, works on Windows 11, macOS and Linux.
 */
const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const http = require('http');
const path = require('path');

const root = path.resolve(__dirname, '..');
const isWindows = process.platform === 'win32';
const API_READY_TIMEOUT_MS = 40000;

/**
 * Read one value from a .env file without a dependency. The API's port decides
 * both the health probe and where Vite proxies /api, so it only has to be
 * changed in server/.env.
 */
function readEnvValue(file, key) {
  try {
    const line = fs
      .readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .find((row) => row.trim().startsWith(`${key}=`));
    if (!line) return undefined;
    return line.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '');
  } catch {
    return undefined;
  }
}

const API_PORT = Number(readEnvValue(path.join(root, 'server', '.env'), 'PORT')) || 5000;
const API_HEALTH_URL = `http://127.0.0.1:${API_PORT}/api/health`;

const children = [];
let shuttingDown = false;

function log(message) {
  process.stdout.write(`\x1b[36m[dev]\x1b[0m ${message}\n`);
}

function fail(message) {
  process.stderr.write(`\x1b[31m[dev]\x1b[0m ${message}\n`);
}

function npmCommand() {
  return isWindows ? 'npm.cmd' : 'npm';
}

function hasDependencies(folder) {
  return fs.existsSync(path.join(root, folder, 'node_modules'));
}

function ensureDependencies() {
  const missing = ['server', 'client'].filter((folder) => !hasDependencies(folder));
  if (missing.length === 0) return true;

  fail(`Dependencies are missing in: ${missing.join(', ')}`);
  fail('Run this once from the repository root, then try again:');
  fail('    npm run setup');
  return false;
}

function ensureEnvFiles() {
  for (const folder of ['server', 'client']) {
    const target = path.join(root, folder, '.env');
    const example = path.join(root, folder, '.env.example');
    if (!fs.existsSync(target) && fs.existsSync(example)) {
      fs.copyFileSync(example, target);
      log(`created ${folder}/.env from ${folder}/.env.example`);
    }
  }
}

function probe() {
  return new Promise((resolve) => {
    const request = http.get(API_HEALTH_URL, { timeout: 1500 }, (response) => {
      response.resume();
      resolve(response.statusCode === 200);
    });
    request.on('timeout', () => {
      request.destroy();
      resolve(false);
    });
    request.on('error', () => resolve(false));
  });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForApi() {
  const deadline = Date.now() + API_READY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (await probe()) return true;
    await sleep(400);
  }
  return false;
}

function run(label, folder, args, extraEnv = {}) {
  const child = spawn(npmCommand(), args, {
    cwd: path.join(root, folder),
    stdio: 'inherit',
    shell: true,
    // A new process group lets one signal stop npm *and* the node process it
    // started. Windows uses taskkill /T instead (see stop()).
    detached: !isWindows,
    env: { ...process.env, ...extraEnv },
  });

  child.label = label;
  children.push(child);

  child.on('exit', (code, signal) => {
    if (shuttingDown) return;
    const reason = signal ? `signal ${signal}` : `code ${code}`;
    fail(`${label} stopped (${reason}). Shutting down the other process.`);
    shutdown(code == null ? 1 : code);
  });

  child.on('error', (error) => {
    fail(`could not start ${label}: ${error.message}`);
    shutdown(1);
  });

  return child;
}

function stop(child) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  if (isWindows) {
    spawnSync('taskkill', ['/pid', String(child.pid), '/t', '/f'], { stdio: 'ignore' });
    return;
  }
  try {
    process.kill(-child.pid, 'SIGTERM');
  } catch {
    try {
      child.kill('SIGTERM');
    } catch {
      /* already gone */
    }
  }
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  log('stopping API and web app...');
  children.forEach(stop);
  setTimeout(() => process.exit(code), 400).unref();
}

process.on('SIGINT', () => {
  log('Ctrl+C received');
  shutdown(0);
});
process.on('SIGTERM', () => shutdown(0));

async function main() {
  if (!ensureDependencies()) process.exit(1);
  ensureEnvFiles();

  log(`starting the API on http://localhost:${API_PORT} ...`);
  run('API', 'server', ['run', 'dev']);

  const ready = await waitForApi();
  if (ready) {
    log('API answered /api/health - starting the web app');
  } else {
    fail('the API did not answer within 40s; starting the web app anyway.');
    fail('The amber banner in the browser will show the error once you open it.');
  }

  // Keep the proxy pointed at the API's real port even when PORT was customised.
  run('Web app', 'client', ['run', 'dev'], {
    VITE_PROXY_TARGET: `http://127.0.0.1:${API_PORT}`,
  });

  setTimeout(() => {
    log('ready:');
    log('    web app  http://localhost:5173');
    log(`    API      ${API_HEALTH_URL}`);
    log('press Ctrl+C to stop both');
  }, 2500);
}

main();
