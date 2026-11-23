"use strict";

const { Router } = require("express");
const { validateRegister, validateLogin } = require("../validators/auth/index");
const { register, login, getMe } = require("../controllers/auth/index");
const authenticate = require("../middleware/authenticate");
const { authLimiter } = require("../middleware/rateLimiter");

const router = Router();

// Apply stricter rate limiting to auth endpoints.
router.use(authLimiter);

/** POST /api/auth/register */
router.post("/register", validateRegister, register);

/** POST /api/auth/login */
router.post("/login", validateLogin, login);

/** GET /api/auth/me — requires a valid JWT */
router.get("/me", authenticate, getMe);

module.exports = router;
