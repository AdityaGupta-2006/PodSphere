"use strict";

const AppError = require("../utils/AppError");

/**
 * Global Express error-handling middleware.
 * Must be registered as the LAST middleware in app.js (4-argument signature).
 * Formats all errors — operational AppErrors and unexpected programming errors —
 * into a consistent JSON response so clients always get a predictable structure.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  // Default to 500 if no status code was set.
  let statusCode = err.statusCode || 500;
  let status = err.status || "error";
  let message = err.message || "An unexpected error occurred.";
  let code = err.code || null;

  // Handle Prisma known request errors.
  if (err.constructor?.name === "PrismaClientKnownRequestError") {
    if (err.code === "P2002") {
      // Unique constraint violation.
      statusCode = 409;
      status = "fail";
      const field = err.meta?.target?.[0] || "field";
      message = `A record with this ${field} already exists.`;
      code = "DUPLICATE_ENTRY";
    } else if (err.code === "P2025") {
      // Record not found.
      statusCode = 404;
      status = "fail";
      message = "The requested record was not found.";
      code = "NOT_FOUND";
    } else if (err.code === "P2003") {
      // Foreign key constraint failure.
      statusCode = 400;
      status = "fail";
      message = "Related record not found. Please verify the referenced resource exists.";
      code = "FOREIGN_KEY_ERROR";
    }
  }

  // Handle JWT errors (should normally be caught by jwt.js, but as a safety net).
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    statusCode = 401;
    status = "fail";
    message = "Invalid or expired authentication token. Please log in again.";
    code = "INVALID_TOKEN";
  }

  // Log unexpected server errors (not operational AppErrors).
  if (!err.isOperational || statusCode >= 500) {
    console.error("[ErrorHandler]", {
      name: err.name,
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  }

  // Never leak stack traces or internal messages in production.
  if (process.env.NODE_ENV === "production" && statusCode >= 500) {
    message = "An unexpected server error occurred. Please try again later.";
  }

  res.status(statusCode).json({
    status,
    code,
    message,
    ...(process.env.NODE_ENV !== "production" && statusCode >= 500
      ? { stack: err.stack }
      : {}),
  });
}

module.exports = errorHandler;
