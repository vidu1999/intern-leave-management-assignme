'use strict';

const ApiError = require('../utils/ApiError');
const {
  DEPARTMENTS,
  EMAIL_PATTERN,
  isPlainObject,
  normaliseText,
} = require('./common');

const NAME_MAX = 120;
const EMAIL_MAX = 180;

/**
 * Validates the payload for creating (or updating) an employee.
 * Returns normalised values or throws an ApiError with field specific messages.
 */
function validateEmployeePayload(body, { partial = false } = {}) {
  if (!isPlainObject(body)) {
    throw ApiError.badRequest('A JSON object is required in the request body.');
  }

  const errors = {};
  const data = {};

  const has = (key) => Object.prototype.hasOwnProperty.call(body, key) && body[key] !== undefined;

  // --- name -----------------------------------------------------------------
  if (!partial || has('name')) {
    const name = normaliseText(body.name);
    if (typeof name !== 'string' || name.length === 0) {
      errors.name = 'Full name is required.';
    } else if (name.length < 2) {
      errors.name = 'Full name must be at least 2 characters long.';
    } else if (name.length > NAME_MAX) {
      errors.name = `Full name must be ${NAME_MAX} characters or fewer.`;
    } else {
      data.name = name;
    }
  }

  // --- email ----------------------------------------------------------------
  if (!partial || has('email')) {
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!email) {
      errors.email = 'Email address is required.';
    } else if (email.length > EMAIL_MAX) {
      errors.email = `Email address must be ${EMAIL_MAX} characters or fewer.`;
    } else if (!EMAIL_PATTERN.test(email)) {
      errors.email = 'Enter a valid email address, for example name@example.com.';
    } else {
      data.email = email;
    }
  }

  // --- department -----------------------------------------------------------
  if (!partial || has('department')) {
    const department = normaliseText(body.department);
    if (typeof department !== 'string' || department.length === 0) {
      errors.department = 'Department is required.';
    } else if (!DEPARTMENTS.includes(department)) {
      errors.department = `Department must be one of: ${DEPARTMENTS.join(', ')}.`;
    } else {
      data.department = department;
    }
  }

  if (Object.keys(errors).length > 0) {
    throw ApiError.validation(errors);
  }
  if (partial && Object.keys(data).length === 0) {
    throw ApiError.badRequest('Provide at least one field to update: name, email or department.');
  }

  return data;
}

module.exports = { validateEmployeePayload, DEPARTMENTS };
