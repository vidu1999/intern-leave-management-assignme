'use strict';

const { getDb } = require('../../db');

/** Maps a database row to the public API shape (camelCase, no internals). */
function toEmployee(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    department: row.department,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function listEmployees({ search } = {}) {
  const db = getDb();
  if (search) {
    const rows = db
      .prepare(
        `SELECT * FROM employees
          WHERE name LIKE ? COLLATE NOCASE
             OR email LIKE ? COLLATE NOCASE
             OR department LIKE ? COLLATE NOCASE
          ORDER BY name COLLATE NOCASE ASC`,
      )
      .all(`%${search}%`, `%${search}%`, `%${search}%`);
    return rows.map(toEmployee);
  }

  return db.prepare('SELECT * FROM employees ORDER BY name COLLATE NOCASE ASC').all().map(toEmployee);
}

function findEmployeeById(id) {
  return toEmployee(getDb().prepare('SELECT * FROM employees WHERE id = ?').get(id));
}

function findEmployeeByEmail(email) {
  return toEmployee(
    getDb().prepare('SELECT * FROM employees WHERE email = ? COLLATE NOCASE').get(email),
  );
}

function insertEmployee({ name, email, department }) {
  const db = getDb();
  const now = new Date().toISOString();
  const result = db
    .prepare(
      'INSERT INTO employees (name, email, department, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    )
    .run(name, email, department, now, now);
  return findEmployeeById(Number(result.lastInsertRowid));
}

function updateEmployee(id, changes) {
  const db = getDb();
  const current = findEmployeeById(id);
  if (!current) return null;

  const next = {
    name: changes.name ?? current.name,
    email: changes.email ?? current.email,
    department: changes.department ?? current.department,
  };

  db.prepare('UPDATE employees SET name = ?, email = ?, department = ?, updated_at = ? WHERE id = ?').run(
    next.name,
    next.email,
    next.department,
    new Date().toISOString(),
    id,
  );
  return findEmployeeById(id);
}

function deleteEmployee(id) {
  return getDb().prepare('DELETE FROM employees WHERE id = ?').run(id).changes > 0;
}

function countLeaveRequestsForEmployee(id) {
  return getDb().prepare('SELECT COUNT(*) AS count FROM leave_requests WHERE employee_id = ?').get(id).count;
}

function countEmployees() {
  return getDb().prepare('SELECT COUNT(*) AS count FROM employees').get().count;
}

module.exports = {
  toEmployee,
  listEmployees,
  findEmployeeById,
  findEmployeeByEmail,
  insertEmployee,
  updateEmployee,
  deleteEmployee,
  countLeaveRequestsForEmployee,
  countEmployees,
};
