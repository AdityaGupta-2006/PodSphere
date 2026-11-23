"use strict";

const AppError = require("../utils/AppError");

/**
 * Role-based authorization middleware factory.
 * Must be used after authenticate middleware so req.user is populated.
 *
 * @param {...string} roles - Allowed Prisma Role enum values (e.g. "PROVIDER", "USER").
 * @returns {Function} Express middleware.
 *
 * @example
 * router.post("/studios", authenticate, authorize("PROVIDER"), createStudio);
 */
function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(AppError.unauthorized());
    }

    if (!roles.includes(req.user.role)) {
      return next(
        AppError.forbidden(
          `This action requires one of the following roles: ${roles.join(", ")}. Your current role is ${req.user.role}.`
        )
      );
    }

    next();
  };
}

module.exports = authorize;
