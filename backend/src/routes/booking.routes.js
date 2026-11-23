"use strict";

const { Router } = require("express");
const { validateCreateBooking, validateUpdateStatus } = require("../validators/booking/index");
const {
  getBookings,
  getBookingById,
  createBooking,
  cancelBooking,
  updateBookingStatus,
} = require("../controllers/booking/index");
const authenticate = require("../middleware/authenticate");

const router = Router();

// All booking routes require authentication.
router.use(authenticate);

/** GET /api/bookings — returns bookings scoped to the authenticated user's role */
router.get("/", getBookings);

/** GET /api/bookings/:id — creator or provider of the studio can access */
router.get("/:id", getBookingById);

/** POST /api/bookings — USER (creator) only */
router.post("/", validateCreateBooking, createBooking);

/** PATCH /api/bookings/:id/cancel — creator cancels their own booking */
router.patch("/:id/cancel", cancelBooking);

/** PATCH /api/bookings/:id/status — provider updates booking status */
router.patch("/:id/status", validateUpdateStatus, updateBookingStatus);

module.exports = router;
