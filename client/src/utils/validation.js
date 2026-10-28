import { DEPARTMENTS, LEAVE_TYPES } from './constants.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

/** Mirrors the backend rule: a strict `YYYY-MM-DD` calendar date. */
export function isIsoDate(value) {
  if (typeof value !== 'string') return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

/** Validates the employee form; returns a `{ field: message }` map. */
export function validateEmployee(values) {
  const errors = {};
  const name = (values.name || '').trim().replace(/\s+/g, ' ');
  const email = (values.email || '').trim().toLowerCase();
  const department = (values.department || '').trim();

  if (!name) {
    errors.name = 'Full name is required.';
  } else if (name.length < 2) {
    errors.name = 'Full name must be at least 2 characters long.';
  } else if (name.length > 120) {
    errors.name = 'Full name must be 120 characters or fewer.';
  }

  if (!email) {
    errors.email = 'Email address is required.';
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter a valid email address, for example name@example.com.';
  }

  if (!department) {
    errors.department = 'Department is required.';
  } else if (!DEPARTMENTS.includes(department)) {
    errors.department = `Department must be one of: ${DEPARTMENTS.join(', ')}.`;
  }

  return errors;
}

/** Validates the leave request form; returns a `{ field: message }` map. */
export function validateLeaveRequest(values) {
  const errors = {};
  const employeeId = values.employeeId;
  const leaveType = (values.leaveType || '').trim();
  const startDate = (values.startDate || '').trim();
  const endDate = (values.endDate || '').trim();
  const reason = (values.reason || '').trim();

  if (!employeeId) {
    errors.employeeId = 'Select an employee.';
  }

  if (!leaveType) {
    errors.leaveType = 'Select a leave type.';
  } else if (!LEAVE_TYPES.includes(leaveType)) {
    errors.leaveType = `Leave type must be one of: ${LEAVE_TYPES.join(', ')}.`;
  }

  if (!startDate) {
    errors.startDate = 'Start date is required.';
  } else if (!isIsoDate(startDate)) {
    errors.startDate = 'Enter a valid start date.';
  }

  if (!endDate) {
    errors.endDate = 'End date is required.';
  } else if (!isIsoDate(endDate)) {
    errors.endDate = 'Enter a valid end date.';
  }

  if (!errors.startDate && !errors.endDate && endDate < startDate) {
    errors.endDate = 'End date must be on or after the start date.';
  }

  if (!reason) {
    errors.reason = 'Please provide a reason for this leave request.';
  } else if (reason.length > 500) {
    errors.reason = 'Reason must be 500 characters or fewer.';
  }

  return errors;
}
