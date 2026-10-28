'use strict';

const config = require('../config');
const ApiError = require('../utils/ApiError');

/**
 * Central error handler.
 *
 * - ApiErrors (4xx/5xx created on purpose) keep their message and field errors.
 * - SQLite constraint violations are translated into safe 4xx/409 responses.
 * - Anything else is logged server side and answered with a generic message so
 *   stack traces, SQL statements and file paths never reach the client.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(error, req, res, next) {
  let statusCode = 500;
  let message = 'An unexpected error occurred. Please try again.';
  let errors;

  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.expose ? error.message : message;
    errors = error.errors;
  } else if (error && typeof error.code === 'string' && error.code.startsWith('SQLITE_CONSTRAINT')) {
    statusCode = 409;
    message = 'The submitted data conflicts with an existing record.';
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      message = 'An employee with this email address already exists.';
      errors = { email: 'An employee with this email address already exists.' };
    } else if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      statusCode = 409;
      message = 'The record is referenced by other data and cannot be changed.';
    } else if (error.code === 'SQLITE_CONSTRAINT_CHECK' || error.code === 'SQLITE_CONSTRAINT_TRIGGER') {
      statusCode = 400;
      message = 'The submitted data violates a database rule.';
    }
  } else if (error instanceof SyntaxError && 'body' in error) {
    statusCode = 400;
    message = 'The request body contains invalid JSON.';
  } else if (error && error.type === 'entity.too.large') {
    statusCode = 413;
    message = 'The request body is too large.';
  }

  if (statusCode >= 500) {
    console.error('[error]', error);
  }

  const payload = { success: false, message };
  if (errors) payload.errors = errors;
  if (!config.isProduction && statusCode >= 500) {
    payload.debug = error.message; // development aid only, never sent in production
  }

  res.status(statusCode).json(payload);
}

module.exports = errorHandler;
