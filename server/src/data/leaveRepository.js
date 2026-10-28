'use strict';

const { getDb } = require('../../db');
const { countDays } = require('../utils/dates');

const SELECT_WITH_EMPLOYEE = `
  SELECT lr.*,
         e.name  AS employee_name,
         e.email AS employee_email,
         e.department AS employee_department
    FROM leave_requests lr
    JOIN employees e ON e.id = lr.employee_id
`;

/** Maps a joined row to the public API shape. */
function toLeaveRequest(row) {
  if (!row) return null;
  return {
    id: row.id,
    employeeId: row.employee_id,
    employee: {
      id: row.employee_id,
      name: row.employee_name,
      email: row.employee_email,
      department: row.employee_department,
    },
    // Kept for convenience in tables where only the name is needed.
    employeeName: row.employee_name,
    leaveType: row.leave_type,
    startDate: row.start_date,
    endDate: row.end_date,
    totalDays: countDays(row.start_date, row.end_date),
    reason: row.reason,
    status: row.status,
    rejectionReason: row.rejection_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Returns a paginated, filtered list of leave requests plus the total number of
 * matching rows. All values are bound as parameters - user input is never
 * concatenated into the SQL string.
 */
function listLeaveRequests({ search, leaveType, status, employeeId, page, pageSize, offset } = {}) {
  const db = getDb();
  const where = [];
  const params = [];

  if (search) {
    where.push('(e.name LIKE ? COLLATE NOCASE OR lr.reason LIKE ? COLLATE NOCASE)');
    params.push(`%${search}%`, `%${search}%`);
  }
  if (leaveType) {
    where.push('lr.leave_type = ?');
    params.push(leaveType);
  }
  if (status) {
    where.push('lr.status = ?');
    params.push(status);
  }
  if (employeeId) {
    where.push('lr.employee_id = ?');
    params.push(employeeId);
  }

  const whereSql = where.length ? ` WHERE ${where.join(' AND ')}` : '';
  const total = db.prepare(`SELECT COUNT(*) AS count FROM leave_requests lr JOIN employees e ON e.id = lr.employee_id${whereSql}`).get(...params).count;

  const limit = pageSize ?? 10;
  const offsetValue = offset ?? 0;
  const rows = db
    .prepare(`${SELECT_WITH_EMPLOYEE}${whereSql} ORDER BY datetime(lr.created_at) DESC, lr.id DESC LIMIT ? OFFSET ?`)
    .all(...params, limit, offsetValue);

  return { items: rows.map(toLeaveRequest), total, page: page ?? 1, pageSize: limit };
}

function findLeaveRequestById(id) {
  return toLeaveRequest(getDb().prepare(`${SELECT_WITH_EMPLOYEE} WHERE lr.id = ?`).get(id));
}

function findRecentLeaveRequests(limit = 4) {
  return getDb()
    .prepare(`${SELECT_WITH_EMPLOYEE} ORDER BY datetime(lr.created_at) DESC, lr.id DESC LIMIT ?`)
    .all(limit)
    .map(toLeaveRequest);
}

function insertLeaveRequest({ employeeId, leaveType, startDate, endDate, reason }) {
  const db = getDb();
  const now = new Date().toISOString();
  // The status is never taken from the client: new requests always start Pending.
  const result = db
    .prepare(
      `INSERT INTO leave_requests
         (employee_id, leave_type, start_date, end_date, reason, status, rejection_reason, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'Pending', NULL, ?, ?)`,
    )
    .run(employeeId, leaveType, startDate, endDate, reason, now, now);

  return findLeaveRequestById(Number(result.lastInsertRowid));
}

/**
 * Conditional update: the WHERE clause guarantees that two concurrent approval
 * requests can never both succeed - only the first one matches `Pending`.
 */
function markApproved(id) {
  const result = getDb()
    .prepare(`UPDATE leave_requests SET status = 'Approved', rejection_reason = NULL, updated_at = ? WHERE id = ? AND status = 'Pending'`)
    .run(new Date().toISOString(), id);
  return result.changes > 0;
}

function markRejected(id, rejectionReason) {
  const result = getDb()
    .prepare(`UPDATE leave_requests SET status = 'Rejected', rejection_reason = ?, updated_at = ? WHERE id = ? AND status = 'Pending'`)
    .run(rejectionReason, new Date().toISOString(), id);
  return result.changes > 0;
}

function countByStatus() {
  const rows = getDb().prepare('SELECT status, COUNT(*) AS count FROM leave_requests GROUP BY status').all();
  const counts = { Pending: 0, Approved: 0, Rejected: 0 };
  for (const row of rows) counts[row.status] = row.count;
  return counts;
}

function countByLeaveType() {
  const rows = getDb()
    .prepare('SELECT leave_type, COUNT(*) AS count FROM leave_requests GROUP BY leave_type')
    .all();
  const counts = { Annual: 0, Casual: 0, Medical: 0 };
  for (const row of rows) counts[row.leave_type] = row.count;
  return counts;
}

function countLeaveRequests() {
  return getDb().prepare('SELECT COUNT(*) AS count FROM leave_requests').get().count;
}

function countLeaveRequestsByLeaveTypeForEmployee(employeeId) {
  return getDb().prepare('SELECT COUNT(*) AS count FROM leave_requests WHERE employee_id = ?').get(employeeId)
    .count;
}

module.exports = {
  toLeaveRequest,
  listLeaveRequests,
  findLeaveRequestById,
  findRecentLeaveRequests,
  insertLeaveRequest,
  markApproved,
  markRejected,
  countByStatus,
  countByLeaveType,
  countLeaveRequests,
  countLeaveRequestsByLeaveTypeForEmployee,
};
