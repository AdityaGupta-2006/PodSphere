"use strict";

const bcrypt = require("bcryptjs");
const prisma = require("../../prisma/client");
const AppError = require("../../utils/AppError");
const { signToken } = require("../../utils/jwt");
const env = require("../../config/env");

/**
 * Registers a new user. Returns { user, token }.
 */
async function register({ name, email, password, role }) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedRole = role === "PROVIDER" ? "PROVIDER" : "USER";

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    throw AppError.conflict(
      "An account with this email address already exists.",
      "DUPLICATE_EMAIL"
    );
  }

  const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: normalizedRole,
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  return { user, token };
}

/**
 * Authenticates a user by email and password. Returns { user, token }.
 */
async function login({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (!user) {
    throw AppError.unauthorized("Invalid email or password.");
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    throw AppError.unauthorized("Invalid email or password.");
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token,
  };
}

/**
 * Returns the authenticated user's profile.
 */
async function getCurrentUser(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  if (!user) throw AppError.notFound("User");
  return user;
}

module.exports = { register, login, getCurrentUser };
