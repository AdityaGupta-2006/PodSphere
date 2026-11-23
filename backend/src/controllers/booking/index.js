"use strict";

const asyncHandler = require("../../utils/asyncHandler");
const bookingService = require("../../services/booking.service");

/**
 * GET /api/bookings
 * Returns bookings for the authenticated user (filtered by role).
 */
const getBookings = asyncHandler(async (req, res) => {
  const filters = { status: req.query.status, studioId: req.query.studioId };
  const bookings = await bookingService.getBookings(req.user, filters);
  res.status(200).json({ status: "success", data: { bookings } });
});

/**
 * GET /api/bookings/:id
 * Returns a single booking (creator or provider of the studio can access it).
 */
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await bookingService.getBookingById(req.params.id, req.user);
  res.status(200).json({ status: "success", data: { booking } });
});

/**
 * POST /api/bookings
 * Creates a new booking. Creator (USER) only.
 */
const createBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.createBooking(req.user.id, req.body);
  res.status(201).json({
    status: "success",
    message: "Booking request submitted. Waiting for provider confirmation.",
    data: { booking },
  });
});

/**
 * PATCH /api/bookings/:id/cancel
 * Cancels a booking. Creator only.
 */
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.cancelBooking(req.params.id, req.user.id);
  res.status(200).json({
    status: "success",
    message: "Booking cancelled.",
    data: { booking },
  });
});

/**
 * PATCH /api/bookings/:id/status
 * Updates a booking's status. Provider only.
 */
const updateBookingStatus = asyncHandler(async (req, res) => {
  const booking = await bookingService.updateBookingStatus(
    req.params.id,
    req.user.id,
    req.body.status
  );
  res.status(200).json({
    status: "success",
    message: `Booking status updated to ${booking.status}.`,
    data: { booking },
  });
});

module.exports = { getBookings, getBookingById, createBooking, cancelBooking, updateBookingStatus };
