'use strict';

const ApiError = require('../utils/ApiError');
const { LEAVE_STATUSES, LEAVE_TYPES, normaliseText } = require('./common');

/**
 * Validates query parameters for GET /api/leaves.
 * Unknown values are rejected so that a typo in a filter never silently
 * returns the full (unfiltered) list.
 */
function validateLeaveQuery(query = {}) {
  const filters = {};

  const search = normaliseText(query.search);
  if (typeof search === 'string' && search.length > 0) {
    if (search.length > 100) {
      throw ApiError.badRequest('The search term must be 100 characters or fewer.');
    }
    filters.search = search;
  }

  const leaveType = normaliseText(query.leaveType);
  if (typeof leaveType === 'string' && leaveType.length > 0) {
    if (!LEAVE_TYPES.includes(leaveType)) {
      throw ApiError.badRequest(`Leave type filter must be one of: ${LEAVE_TYPES.join(', ')}.`);
    }
    filters.leaveType = leaveType;
  }

  const status = normaliseText(query.status);
  if (typeof status === 'string' && status.length > 0) {
    if (!LEAVE_STATUSES.includes(status)) {
      throw ApiError.badRequest(`Status filter must be one of: ${LEAVE_STATUSES.join(', ')}.`);
    }
    filters.status = status;
  }

  return filters;
}

module.exports = { validateLeaveQuery };
