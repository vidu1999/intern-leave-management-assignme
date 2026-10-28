'use strict';

/**
 * Application error with an HTTP status code and optional field level
 * validation details. Only `expose`d errors (4xx) surface their message to the
 * client; unexpected errors are logged and replaced by a generic message.
 */
class ApiError extends Error {
  constructor(statusCode, message, errors = undefined) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
    this.expose = statusCode < 500;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, errors) {
    return new ApiError(400, message, errors);
  }

  static notFound(message = 'Resource not found.') {
    return new ApiError(404, message);
  }

  static conflict(message, errors) {
    return new ApiError(409, message, errors);
  }

  static validation(errors) {
    const first = Object.values(errors)[0] || 'The submitted data is invalid.';
    return new ApiError(400, first, errors);
  }
}

module.exports = ApiError;
