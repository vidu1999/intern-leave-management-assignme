'use strict';

/**
 * Database connection helper.
 *
 * SQLite is accessed through better-sqlite3, which executes prepared,
 * parameterised statements only - no string concatenation of user input ever
 * reaches the database. Foreign keys are enforced by the engine and WAL mode
 * is enabled so that concurrent reads do not block writers.
 */
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const config = require('../src/config');

let connection = null;

function openDatabase(file = config.databaseFile) {
  if (file !== ':memory:') {
    fs.mkdirSync(path.dirname(file), { recursive: true });
  }

  const db = new Database(file, { fileMustExist: false });
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');
  return db;
}

function getDb() {
  if (!connection) {
    connection = openDatabase();
  }
  return connection;
}

function setDb(db) {
  connection = db;
}

function closeDb() {
  if (connection) {
    connection.close();
    connection = null;
  }
}

module.exports = { getDb, setDb, closeDb, openDatabase };
