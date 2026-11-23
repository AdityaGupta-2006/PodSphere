"use strict";

/**
 * Custom operational error class.
 * Operational errors (bad requests, auth failures, not found, etc.) carry an
 * HTTP status code and are intentionally thrown by application code.
 * They are distinguished from unexpected programming errors so the global
 * error handler can respond with structured JSON instead of a stack trace.
 */
class AppError extends Error {
  /**
   * @param {string} message  - Human-readable error description.
   * @param {number} statusCode - HTTP status code (4xx / 5xx).
   * @param {string} [code]   - Optional machine-readable error code (e.g. "BOOKING_CONFLICT").
   */
  constructor(message, statusCode, code) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.status = statusCode >= 500 ? "error" : "fail";
    this.code = code || null;
    this.isOperational = true;

    // Preserves the prototype chain in TypeScript / transpiled environments.
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  /**
   * Factory helpers for the most common HTTP errors.
   */
  static badRequest(message, code) {
    return new AppError(message, 400, code);
  }

  static unauthorized(message = "Authentication required.") {
    return new AppError(message, 401, "UNAUTHORIZED");
  }

  static forbidden(message = "You do not have permission to perform this action.") {
    return new AppError(message, 403, "FORBIDDEN");
  }

  static notFound(resource = "Resource") {
    return new AppError(`${resource} not found.`, 404, "NOT_FOUND");
  }

  static conflict(message, code = "CONFLICT") {
    return new AppError(message, 409, code);
  }

  static internal(message = "An unexpected error occurred. Please try again later.") {
    return new AppError(message, 500, "INTERNAL_ERROR");
  }
}

module.exports = AppError;
