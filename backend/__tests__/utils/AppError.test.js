"use strict";

const AppError = require("../../src/utils/AppError");

describe("AppError", () => {
  describe("constructor", () => {
    it("creates an error with correct properties", () => {
      const err = new AppError("Something went wrong", 400, "BAD_INPUT");
      expect(err).toBeInstanceOf(Error);
      expect(err).toBeInstanceOf(AppError);
      expect(err.message).toBe("Something went wrong");
      expect(err.statusCode).toBe(400);
      expect(err.status).toBe("fail");
      expect(err.code).toBe("BAD_INPUT");
      expect(err.isOperational).toBe(true);
    });

    it("sets status to 'error' for 5xx status codes", () => {
      const err = new AppError("Server error", 500);
      expect(err.status).toBe("error");
    });

    it("sets status to 'fail' for 4xx status codes", () => {
      const err = new AppError("Client error", 404);
      expect(err.status).toBe("fail");
    });

    it("sets code to null when not provided", () => {
      const err = new AppError("Simple error", 400);
      expect(err.code).toBeNull();
    });
  });

  describe("factory helpers", () => {
    it("badRequest creates a 400 AppError", () => {
      const err = AppError.badRequest("Invalid input", "INVALID");
      expect(err.statusCode).toBe(400);
      expect(err.code).toBe("INVALID");
      expect(err.isOperational).toBe(true);
    });

    it("unauthorized creates a 401 AppError with UNAUTHORIZED code", () => {
      const err = AppError.unauthorized();
      expect(err.statusCode).toBe(401);
      expect(err.code).toBe("UNAUTHORIZED");
    });

    it("unauthorized accepts a custom message", () => {
      const err = AppError.unauthorized("Token expired.");
      expect(err.message).toBe("Token expired.");
    });

    it("forbidden creates a 403 AppError with FORBIDDEN code", () => {
      const err = AppError.forbidden();
      expect(err.statusCode).toBe(403);
      expect(err.code).toBe("FORBIDDEN");
    });

    it("notFound creates a 404 AppError with NOT_FOUND code", () => {
      const err = AppError.notFound("Studio");
      expect(err.statusCode).toBe(404);
      expect(err.code).toBe("NOT_FOUND");
      expect(err.message).toBe("Studio not found.");
    });

    it("notFound uses default resource name when not provided", () => {
      const err = AppError.notFound();
      expect(err.message).toBe("Resource not found.");
    });

    it("conflict creates a 409 AppError", () => {
      const err = AppError.conflict("Duplicate email", "DUPLICATE_EMAIL");
      expect(err.statusCode).toBe(409);
      expect(err.code).toBe("DUPLICATE_EMAIL");
    });

    it("conflict uses default CONFLICT code when not specified", () => {
      const err = AppError.conflict("Conflict occurred");
      expect(err.code).toBe("CONFLICT");
    });

    it("internal creates a 500 AppError", () => {
      const err = AppError.internal();
      expect(err.statusCode).toBe(500);
      expect(err.status).toBe("error");
    });
  });
});
