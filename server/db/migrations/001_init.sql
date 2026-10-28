-- ---------------------------------------------------------------------------
-- 001_init.sql - initial LeaveManager schema
--
-- Relationships
--   employees 1 ─── * leave_requests (leave_requests.employee_id → employees.id)
--
-- The database enforces the important invariants in addition to the service
-- layer so that no code path can persist an invalid row:
--   * employee e-mail addresses are unique (case-insensitive)
--   * status is limited to Pending / Approved / Rejected
--   * leave_type is limited to Annual / Casual / Medical
--   * end_date can never be earlier than start_date
--   * a rejected request must carry a rejection reason, and every other status
--     must not carry one
--   * deleting an employee that still owns leave requests is refused (RESTRICT)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS employees (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL CHECK (length(trim(name)) > 0),
  email      TEXT    NOT NULL UNIQUE COLLATE NOCASE CHECK (length(trim(email)) > 0),
  department TEXT    NOT NULL CHECK (length(trim(department)) > 0),
  created_at TEXT    NOT NULL,
  updated_at TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS leave_requests (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id      INTEGER NOT NULL REFERENCES employees (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  leave_type       TEXT    NOT NULL CHECK (leave_type IN ('Annual', 'Casual', 'Medical')),
  start_date       TEXT    NOT NULL CHECK (start_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  end_date         TEXT    NOT NULL CHECK (end_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  reason           TEXT    NOT NULL CHECK (length(trim(reason)) > 0),
  status           TEXT    NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  rejection_reason TEXT,
  created_at       TEXT    NOT NULL,
  updated_at       TEXT    NOT NULL,
  CHECK (end_date >= start_date),
  CHECK (
    (status = 'Rejected' AND rejection_reason IS NOT NULL AND length(trim(rejection_reason)) > 0)
    OR (status <> 'Rejected' AND rejection_reason IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON leave_requests (employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests (status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_created ON leave_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_employees_name ON employees (name COLLATE NOCASE);
