"use strict";

const AppError = require("../utils/AppError");

/**
 * Validation middleware factory.
 * Accepts a plain-object schema definition and validates req.body against it.
 * Schema keys map to validator functions: (value, body) => string|null
 * — returning a string means validation failed with that message,
 * — returning null means the field passed.
 *
 * @param {Record<string, (value: any, body: object) => string|null>} schema
 * @returns {Function} Express middleware.
 *
 * @example
 * validate({
 *   email: (v) => !v ? "Email is required." : null,
 *   password: (v) => v?.length < 8 ? "Password must be at least 8 characters." : null,
 * })
 */
function validate(schema) {
  return (req, _res, next) => {
    const errors = [];

    for (const [field, validator] of Object.entries(schema)) {
      const value = req.body[field];
      const error = validator(value, req.body);
      if (error) {
        errors.push({ field, message: error });
      }
    }

    if (errors.length > 0) {
      const message = errors.map((e) => e.message).join(" ");
      const err = AppError.badRequest(message, "VALIDATION_ERROR");
      err.errors = errors;
      return next(err);
    }

    next();
  };
}

module.exports = validate;
