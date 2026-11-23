"use strict";

const jwt = require("jsonwebtoken");
const env = require("../config/env");
const AppError = require("./AppError");

/**
 * Signs a JWT containing the given payload.
 *
 * @param {{ id: string, email: string, role: string }} payload
 * @returns {string} Signed JWT string.
 */
function signToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

/**
 * Verifies a JWT and returns the decoded payload.
 * Throws AppError(401) if the token is invalid or expired.
 *
 * @param {string} token
 * @returns {{ id: string, email: string, role: string, iat: number, exp: number }}
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw AppError.unauthorized("Your session has expired. Please log in again.");
    }
    throw AppError.unauthorized("Invalid or malformed authentication token.");
  }
}

/**
 * Extracts the Bearer token from an Authorization header value.
 *
 * @param {string|undefined} authorizationHeader
 * @returns {string|null}
 */
function extractBearerToken(authorizationHeader) {
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authorizationHeader.slice(7).trim();
  return token || null;
}

module.exports = { signToken, verifyToken, extractBearerToken };
