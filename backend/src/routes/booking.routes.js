const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/booking");
const authenticate = require("../middleware/authenticate");
const { requireProvider } = require("../middleware/authorize");

// Create booking
router.post("/", authenticate, bookingController.createBooking);

// List bookings (role-aware query support for frontend)
router.get("/", authenticate, bookingController.getBookings);

// Explicit creator / provider list endpoints
router.get("/creator", authenticate, bookingController.getCreatorBookings);
router.get("/provider", authenticate, requireProvider, bookingController.getProviderBookings);

// Get single booking
router.get("/:id", authenticate, bookingController.getBooking);

// Provider status update
router.patch("/:id/status", authenticate, requireProvider, bookingController.updateStatus);

// Creator cancellation
router.patch("/:id/cancel", authenticate, bookingController.cancelBooking);

module.exports = router;
