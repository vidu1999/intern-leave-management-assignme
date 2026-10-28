'use strict';

const ApiError = require('../utils/ApiError');

const DEPARTMENTS = ['IT', 'HR', 'Finance', 'Marketing', 'Operations', 'Other'];
const LEAVE_TYPES = ['Annual', 'Casual', 'Medical'];
const LEAVE_STATUSES = ['Pending', 'Approved', 'Rejected'];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Trims strings and collapses the surrounding whitespace of user input. */
function normaliseText(value) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value;
}

/**
 * Validates an `:id` route parameter.
 * Throws a 400 ApiError for values such as `abc`, `1.5`, `-3` or `99999999999999999999`.
 */
function parseIdParam(value, label = 'id') {
  const raw = String(value ?? '').trim();
  if (!/^\d+$/.test(raw)) {
    throw ApiError.badRequest(`The ${label} must be a positive integer.`);
  }
  const id = Number(raw);
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw ApiError.badRequest(`The ${label} must be a positive integer.`);
  }
  return id;
}

function parsePagination(query = {}) {
  const page = Math.max(1, Number.parseInt(String(query.page ?? '1'), 10) || 1);
  const requestedSize = Number.parseInt(String(query.pageSize ?? '10'), 10) || 10;
  const pageSize = Math.min(100, Math.max(1, requestedSize));
  return { page, pageSize, offset: (page - 1) * pageSize };
}

module.exports = {
  DEPARTMENTS,
  LEAVE_TYPES,
  LEAVE_STATUSES,
  EMAIL_PATTERN,
  isPlainObject,
  normaliseText,
  parseIdParam,
  parsePagination,
};
