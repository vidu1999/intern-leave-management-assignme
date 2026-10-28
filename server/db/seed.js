'use strict';

/**
 * Development-only demo data.
 *
 * This script is NOT executed automatically. Every record it creates is
 * demonstration data for screenshots / interviews - it is never presented by
 * the application as real company data. The database starts empty otherwise.
 *
 *   npm run db:seed          (creates demo data when the database is empty)
 *   npm run db:seed -- --force   (resets and re-creates the demo data set)
 */
const config = require('../src/config');
const { openDatabase } = require('./index');
const { runMigrations } = require('./migrate');

const DEMO_EMPLOYEES = [
  { name: 'Kasun Perera', email: 'kasun.perera@omibits.example', department: 'IT' },
  { name: 'Nimali Fernando', email: 'nimali.fernando@omibits.example', department: 'HR' },
  { name: 'Tharindu Silva', email: 'tharindu.silva@omibits.example', department: 'Finance' },
  { name: 'Ishara Jayasinghe', email: 'ishara.jayasinghe@omibits.example', department: 'Marketing' },
  { name: 'Dineshka Wijesinghe', email: 'dineshka.wijesinghe@omibits.example', department: 'Operations' },
  { name: 'Ravindu Bandara', email: 'ravindu.bandara@omibits.example', department: 'IT' },
];

const DEMO_LEAVES = [
  {
    employeeEmail: 'kasun.perera@omibits.example',
    leaveType: 'Annual',
    startDate: '2026-11-02',
    endDate: '2026-11-06',
    reason: 'Family holiday booked earlier this year.',
    status: 'Pending',
  },
  {
    employeeEmail: 'nimali.fernando@omibits.example',
    leaveType: 'Medical',
    startDate: '2026-10-20',
    endDate: '2026-10-22',
    reason: 'Recovering from flu - medical certificate submitted to HR.',
    status: 'Approved',
  },
  {
    employeeEmail: 'tharindu.silva@omibits.example',
    leaveType: 'Casual',
    startDate: '2026-10-28',
    endDate: '2026-10-28',
    reason: 'Personal errands in the morning.',
    status: 'Pending',
  },
  {
    employeeEmail: 'ishara.jayasinghe@omibits.example',
    leaveType: 'Annual',
    startDate: '2026-09-14',
    endDate: '2026-09-18',
    reason: 'Annual vacation with family.',
    status: 'Rejected',
    rejectionReason: 'Marketing campaign launch week - insufficient staffing during the requested period.',
  },
  {
    employeeEmail: 'dineshka.wijesinghe@omibits.example',
    leaveType: 'Casual',
    startDate: '2026-10-12',
    endDate: '2026-10-13',
    reason: 'Attending a family function out of town.',
    status: 'Approved',
  },
  {
    employeeEmail: 'ravindu.bandara@omibits.example',
    leaveType: 'Medical',
    startDate: '2026-11-16',
    endDate: '2026-11-18',
    reason: 'Planned dental surgery and recovery.',
    status: 'Pending',
  },
  {
    employeeEmail: 'kasun.perera@omibits.example',
    leaveType: 'Casual',
    startDate: '2026-08-03',
    endDate: '2026-08-04',
    reason: 'Moving to a new apartment.',
    status: 'Approved',
  },
  {
    employeeEmail: 'nimali.fernando@omibits.example',
    leaveType: 'Annual',
    startDate: '2026-12-21',
    endDate: '2026-12-31',
    reason: 'Year-end holiday with family abroad.',
    status: 'Pending',
  },
];

function seed(db, { force = false } = {}) {
  const existing = db.prepare('SELECT COUNT(*) AS count FROM employees').get().count;

  if (existing > 0 && !force) {
    return { skipped: true, employees: existing };
  }

  const now = new Date().toISOString();
  const insertEmployee = db.prepare(
    `INSERT INTO employees (name, email, department, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
  );
  const findEmployee = db.prepare('SELECT id FROM employees WHERE email = ?');
  const insertLeave = db.prepare(
    `INSERT INTO leave_requests
       (employee_id, leave_type, start_date, end_date, reason, status, rejection_reason, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );

  const run = db.transaction(() => {
    if (force) {
      // Restart the demo identifiers at 1 so screenshots stay deterministic.
      db.exec(
        "DELETE FROM leave_requests; DELETE FROM employees; DELETE FROM sqlite_sequence WHERE name IN ('employees', 'leave_requests');",
      );
    }

    for (const employee of DEMO_EMPLOYEES) {
      insertEmployee.run(employee.name, employee.email, employee.department, now, now);
    }

    for (const [index, leave] of DEMO_LEAVES.entries()) {
      const employee = findEmployee.get(leave.employeeEmail);
      if (!employee) continue;
      const createdAt = new Date(Date.now() - index * 36e5 * 9).toISOString();
      insertLeave.run(
        employee.id,
        leave.leaveType,
        leave.startDate,
        leave.endDate,
        leave.reason,
        leave.status,
        leave.status === 'Rejected' ? leave.rejectionReason : null,
        createdAt,
        createdAt,
      );
    }
  });

  run();
  return { skipped: false, employees: DEMO_EMPLOYEES.length, leaves: DEMO_LEAVES.length };
}

function main() {
  const force = process.argv.includes('--force');
  const db = openDatabase();
  try {
    runMigrations(db);
    const result = seed(db, { force });
    if (result.skipped) {
      console.log('Demo data skipped: the database already contains employees.');
      console.log('Run "npm run db:seed -- --force" to replace the existing data with the demo data set.');
    } else {
      console.log('DEMO DATA created (for demonstration only - not real company data):');
      console.log(`  employees:      ${result.employees}`);
      console.log(`  leave requests: ${result.leaves}`);
      console.log(`Database file: ${config.databaseFile}`);
    }
  } finally {
    db.close();
  }
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  }
}

module.exports = { seed, DEMO_EMPLOYEES, DEMO_LEAVES };
