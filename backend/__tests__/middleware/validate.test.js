"use strict";

// Stub env variables before requiring any module that imports env.js.
process.env.DATABASE_URL = "postgresql://test:test@localhost/test";
process.env.JWT_SECRET = "test-jwt-secret-for-unit-tests-only";

const validate = require("../../src/middleware/validate");
const AppError = require("../../src/utils/AppError");

function runMiddleware(schema, body) {
  return new Promise((resolve, reject) => {
    const req = { body };
    const _res = {};
    const next = (arg) => {
      if (arg instanceof Error) reject(arg);
      else resolve(arg);
    };
    validate(schema)(req, _res, next);
  });
}

describe("validate middleware", () => {
  const schema = {
    name: (v) => (!v || !v.trim() ? "Name is required." : null),
    email: (v) => (!v || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "Invalid email." : null),
  };

  it("calls next() without error when all fields are valid", async () => {
    const result = await runMiddleware(schema, { name: "Alice", email: "alice@test.com" });
    expect(result).toBeUndefined();
  });

  it("calls next(AppError) when a required field is missing", async () => {
    expect.assertions(3);
    try {
      await runMiddleware(schema, { name: "", email: "alice@test.com" });
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect(err.statusCode).toBe(400);
      expect(err.message).toContain("Name is required.");
    }
  });

  it("includes all field errors in the error.errors array", async () => {
    expect.assertions(2);
    try {
      await runMiddleware(schema, { name: "", email: "not-valid" });
    } catch (err) {
      expect(err.errors).toHaveLength(2);
      expect(err.errors.map((e) => e.field)).toEqual(expect.arrayContaining(["name", "email"]));
    }
  });

  it("sets error code to VALIDATION_ERROR", async () => {
    expect.assertions(1);
    try {
      await runMiddleware(schema, { name: "" });
    } catch (err) {
      expect(err.code).toBe("VALIDATION_ERROR");
    }
  });

  it("passes when schema is empty (no fields to validate)", async () => {
    const result = await runMiddleware({}, { anything: "value" });
    expect(result).toBeUndefined();
  });
});
