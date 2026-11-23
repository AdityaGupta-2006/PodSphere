"use strict";

const rateLimit = require("express-rate-limit");
const env = require("../config/env");

/**
 * General API rate limiter.
 * Applies to all /api routes and limits each IP to env.RATE_LIMIT_MAX
 * requests per env.RATE_LIMIT_WINDOW_MS milliseconds (default: 100 req / 15 min).
 */
const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,  // Return RateLimit-* headers per draft-6.
  legacyHeaders: false,
  message: {
    status: "fail",
    code: "RATE_LIMIT_EXCEEDED",
    message: "Too many requests from this IP. Please wait and try again later.",
  },
});

/**
 * Stricter limiter for authentication endpoints to slow brute-force attacks.
 * Allows 20 requests per 15-minute window per IP.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    code: "AUTH_RATE_LIMIT_EXCEEDED",
    message: "Too many login or registration attempts. Please try again in 15 minutes.",
  },
});

module.exports = { apiLimiter, authLimiter };
