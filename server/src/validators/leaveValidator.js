'use strict';

const ApiError = require('../utils/ApiError');
const { parseIsoDate } = require('../utils/dates');
const { LEAVE_TYPES, isPlainObject, normaliseText } = require('./common');

const REASON_MAX = 500;
const REJECTION_REASON_MAX = 500;

/**
 * Validates the payload for creating a leave request.
 * The client may never choose the status: the service always assigns Pending.
 */
function validateCreateLeavePayload(body) {
  if (!isPlainObject(body)) {
    throw ApiError.badRequest('A JSON object is required in the request body.');
  }

  const errors = {};
  const data = {};

  // --- employee -------------------------------------------------------------
  const rawEmployeeId = body.employeeId;
  const employeeId =
    typeof rawEmployeeId === 'string' && /^\d+$/.test(rawEmployeeId.trim())
      ? Number(rawEmployeeId.trim())
      : rawEmployeeId;

  if (rawEmployeeId === undefined || rawEmployeeId === null || rawEmployeeId === '') {
    errors.employeeId = 'Select an employee.';
  } else if (!Number.isSafeInteger(employeeId) || employeeId <= 0) {
    errors.employeeId = 'Select a valid employee.';
  } else {
    data.employeeId = employeeId;
  }

  // --- leave type -----------------------------------------------------------
  const leaveType = normaliseText(body.leaveType);
  if (!leaveType) {
    errors.leaveType = 'Select a leave type.';
  } else if (!LEAVE_TYPES.includes(leaveType)) {
    errors.leaveType = `Leave type must be one of: ${LEAVE_TYPES.join(', ')}.`;
  } else {
    data.leaveType = leaveType;
  }

  // --- dates ----------------------------------------------------------------
  const startDate = typeof body.startDate === 'string' ? body.startDate.trim() : '';
  const endDate = typeof body.endDate === 'string' ? body.endDate.trim() : '';
  const parsedStart = parseIsoDate(startDate);
  const parsedEnd = parseIsoDate(endDate);

  if (!startDate) {
    errors.startDate = 'Start date is required.';
  } else if (!parsedStart) {
    errors.startDate = 'Enter a valid start date in YYYY-MM-DD format.';
  } else {
    data.startDate = startDate;
  }

  if (!endDate) {
    errors.endDate = 'End date is required.';
  } else if (!parsedEnd) {
    errors.endDate = 'Enter a valid end date in YYYY-MM-DD format.';
  } else {
    data.endDate = endDate;
  }

  if (parsedStart && parsedEnd && parsedEnd.getTime() < parsedStart.getTime()) {
    errors.endDate = 'End date must be on or after the start date.';
  }

  // --- reason ---------------------------------------------------------------
  const reason = normaliseText(body.reason);
  if (typeof reason !== 'string' || reason.length === 0) {
    errors.reason = 'Reason is required.';
  } else if (reason.length > REASON_MAX) {
    errors.reason = `Reason must be ${REASON_MAX} characters or fewer.`;
  } else {
    data.reason = reason;
  }

  if (Object.keys(errors).length > 0) {
    throw ApiError.validation(errors);
  }

  return data;
}

/** Validates the body of PATCH /api/leaves/:id/reject */
function validateRejectionPayload(body) {
  if (!isPlainObject(body)) {
    throw ApiError.badRequest('A JSON object is required in the request body.');
  }

  const rejectionReason = normaliseText(body.rejectionReason);

  if (typeof rejectionReason !== 'string' || rejectionReason.length === 0) {
    throw ApiError.validation({ rejectionReason: 'A rejection reason is required.' });
  }
  if (rejectionReason.length > REJECTION_REASON_MAX) {
    throw ApiError.validation({
      rejectionReason: `Rejection reason must be ${REJECTION_REASON_MAX} characters or fewer.`,
    });
  }

  return { rejectionReason };
}

module.exports = {
  validateCreateLeavePayload,
  validateRejectionPayload,
  LEAVE_TYPES,
  REASON_MAX,
  REJECTION_REASON_MAX,
};
