"use strict";

const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { extractBearerToken, verifyToken } = require("../utils/jwt");
const prisma = require("../prisma/client");

/**
 * Authentication middleware.
 * Validates the Bearer JWT from the Authorization header, looks up the user
 * in the database, and attaches the user record to req.user.
 * Calls next(AppError) on any failure so the global error handler responds with JSON.
 */
const authenticate = asyncHandler(async (req, _res, next) => {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    throw AppError.unauthorized("No authentication token provided. Please log in.");
  }

  // Verify signature and expiry — throws AppError(401) on failure.
  const decoded = verifyToken(token);

  // Confirm the user still exists in the database.
  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!user) {
    throw AppError.unauthorized("The account associated with this token no longer exists.");
  }

  req.user = user;
  next();
});

module.exports = authenticate;
