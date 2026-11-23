const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/booking");
const authenticate = require("../middleware/authenticate");
const { requireProvider } = require("../middleware/authorize");

// Dedicated provider console endpoints
router.get("/bookings", authenticate, requireProvider, bookingController.getProviderBookings);
router.patch("/bookings/:id/status", authenticate, requireProvider, bookingController.updateStatus);

module.exports = router;
