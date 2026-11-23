"use strict";

const validate = require("../../middleware/validate");

/**
 * Validation schemas for authentication endpoints.
 */

const registerSchema = {
  name: (v) => {
    if (!v || typeof v !== "string" || !v.trim()) return "Name is required.";
    if (v.trim().length < 2) return "Name must be at least 2 characters.";
    if (v.trim().length > 100) return "Name must not exceed 100 characters.";
    return null;
  },
  email: (v) => {
    if (!v || typeof v !== "string" || !v.trim()) return "Email is required.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(v.trim())) return "Please provide a valid email address.";
    return null;
  },
  password: (v) => {
    if (!v || typeof v !== "string") return "Password is required.";
    if (v.length < 8) return "Password must be at least 8 characters.";
    if (v.length > 128) return "Password must not exceed 128 characters.";
    return null;
  },
  role: (v) => {
    if (v && !["USER", "PROVIDER"].includes(v)) {
      return "Role must be USER or PROVIDER.";
    }
    return null;
  },
};

const loginSchema = {
  email: (v) => {
    if (!v || typeof v !== "string" || !v.trim()) return "Email is required.";
    return null;
  },
  password: (v) => {
    if (!v || typeof v !== "string" || !v.trim()) return "Password is required.";
    return null;
  },
};

module.exports = {
  validateRegister: validate(registerSchema),
  validateLogin: validate(loginSchema),
};
