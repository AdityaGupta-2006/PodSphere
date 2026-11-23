"use strict";

/**
 * Wraps an async Express route handler so that any rejected promise or thrown
 * error is automatically forwarded to Express's next(err) error pipeline.
 * Eliminates the need for try/catch boilerplate in every controller.
 *
 * @param {Function} fn - Async (req, res, next) => Promise<void>
 * @returns {Function}  - Standard Express middleware / route handler.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
