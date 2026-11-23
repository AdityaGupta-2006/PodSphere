"use strict";

const asyncHandler = require("../../utils/asyncHandler");
const authService = require("../../services/auth.service");

/**
 * POST /api/auth/register
 * Registers a new user and returns a JWT.
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const { user, token } = await authService.register({ name, email, password, role });

  res.status(201).json({
    status: "success",
    message: "Account created successfully.",
    data: { user, token },
  });
});

/**
 * POST /api/auth/login
 * Authenticates a user and returns a JWT.
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await authService.login({ email, password });

  res.status(200).json({
    status: "success",
    message: "Login successful.",
    data: { user, token },
  });
});

/**
 * GET /api/auth/me
 * Returns the authenticated user's profile (requires authenticate middleware).
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

module.exports = { register, login, getMe };
