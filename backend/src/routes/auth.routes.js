const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const authenticate = require("../middleware/authenticate");

// Public endpoints
router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected endpoints
router.get("/me", authenticate, authController.getMe);
router.post("/activate-provider", authenticate, authController.activateProvider);

module.exports = router;
