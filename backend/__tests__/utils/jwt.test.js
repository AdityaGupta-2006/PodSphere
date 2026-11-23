"use strict";

// Provide dummy required env variables so env.js doesn't exit during import.
process.env.DATABASE_URL = "postgresql://test:test@localhost/test";
process.env.JWT_SECRET = "test-jwt-secret-for-unit-tests-only";

const { signToken, verifyToken, extractBearerToken } = require("../../src/utils/jwt");
const AppError = require("../../src/utils/AppError");

describe("jwt utilities", () => {
  const payload = { id: "user-123", email: "user@test.com", role: "USER" };

  describe("signToken / verifyToken", () => {
    it("signs a token and verifies it successfully", () => {
      const token = signToken(payload);
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3); // JWT has 3 parts.

      const decoded = verifyToken(token);
      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    it("throws AppError(401) for a tampered token", () => {
      const token = signToken(payload);
      const tampered = token.slice(0, -5) + "XXXXX";
      expect(() => verifyToken(tampered)).toThrow(AppError);
      try {
        verifyToken(tampered);
      } catch (err) {
        expect(err.statusCode).toBe(401);
      }
    });

    it("throws AppError(401) for a completely invalid token", () => {
      expect(() => verifyToken("not.a.jwt")).toThrow(AppError);
    });
  });

  describe("extractBearerToken", () => {
    it("returns the token from a valid Bearer header", () => {
      const token = "mytoken123";
      expect(extractBearerToken(`Bearer ${token}`)).toBe(token);
    });

    it("returns null when the Authorization header is missing", () => {
      expect(extractBearerToken(undefined)).toBeNull();
      expect(extractBearerToken(null)).toBeNull();
    });

    it("returns null when the header does not start with 'Bearer '", () => {
      expect(extractBearerToken("Basic dXNlcjpwYXNz")).toBeNull();
      expect(extractBearerToken("token abc123")).toBeNull();
    });

    it("returns null when the token part is empty after stripping 'Bearer '", () => {
      expect(extractBearerToken("Bearer ")).toBeNull();
      expect(extractBearerToken("Bearer")).toBeNull();
    });
  });
});
