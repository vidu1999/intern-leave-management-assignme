'use strict';

/**
 * Test helper: every test file gets its own isolated in-memory SQLite database
 * with the real migrations applied. No file on disk, no production data and no
 * shared state between test files.
 */
process.env.NODE_ENV = 'test';
process.env.DATABASE_FILE = ':memory:';

const { openDatabase, setDb, closeDb } = require('../../db');
const { runMigrations } = require('../../db/migrate');

function createTestDatabase() {
  const db = openDatabase(':memory:');
  runMigrations(db);
  setDb(db);
  return db;
}

function resetDatabase() {
  closeDb();
  const db = createTestDatabase();
  return db;
}

function seedEmployee(overrides = {}) {
  const { getDb } = require('../../db');
  const now = new Date().toISOString();
  const employee = {
    name: 'Kasun Perera',
    email: `kasun.${Math.random().toString(36).slice(2, 8)}@example.com`,
    department: 'IT',
    ...overrides,
  };
  const result = getDb()
    .prepare('INSERT INTO employees (name, email, department, created_at, updated_at) VALUES (?, ?, ?, ?, ?)')
    .run(employee.name, employee.email, employee.department, now, now);

  return { id: Number(result.lastInsertRowid), ...employee };
}

function seedLeaveRequest(overrides = {}) {
  const { getDb } = require('../../db');
  const employee = overrides.employee || seedEmployee();
  const now = new Date().toISOString();
  const request = {
    leaveType: 'Annual',
    startDate: '2026-11-02',
    endDate: '2026-11-04',
    reason: 'Family vacation',
    status: 'Pending',
    rejectionReason: null,
    ...overrides,
  };

  const result = getDb()
    .prepare(
      `INSERT INTO leave_requests
         (employee_id, leave_type, start_date, end_date, reason, status, rejection_reason, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      employee.id,
      request.leaveType,
      request.startDate,
      request.endDate,
      request.reason,
      request.status,
      request.status === 'Rejected' ? request.rejectionReason : null,
      now,
      now,
    );

  return { id: Number(result.lastInsertRowid), employee, ...request };
}

module.exports = { createTestDatabase, resetDatabase, seedEmployee, seedLeaveRequest };
