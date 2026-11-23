const bookingService = require("../../services/booking.service");
const studioService = require("../../services/studio.service");
const { parseTimeSlot } = require("../../utils/time");

// Create studio booking: POST /api/bookings
async function createBooking(req, res, next) {
  try {
    const { studioId, rawDate, time } = req.body;

    // 1. Validate required inputs
    if (!studioId || typeof studioId !== "string" || !studioId.trim()) {
      return res.status(400).json({ error: "Studio ID is required for booking." });
    }

    if (!rawDate || typeof rawDate !== "string" || !rawDate.trim()) {
      return res.status(400).json({ error: "Booking date is required." });
    }

    if (!time || typeof time !== "string" || !time.trim()) {
      return res.status(400).json({ error: "Time slot is required." });
    }

    // 2. Validate booking date is not in the past (in Indian local context)
    const selectedDate = new Date(`${rawDate.trim()}T23:59:59+05:30`);
    const now = new Date();
    if (selectedDate < now) {
      return res.status(400).json({ error: "Booking date cannot be in the past." });
    }

    // 3. Parse time slot into IST start and end Date objects
    const parsedSlot = parseTimeSlot(rawDate.trim(), time.trim());
    if (!parsedSlot) {
      return res.status(400).json({ error: "Invalid time slot format. Example: '10:00 AM - 12:00 PM' or '14:00 - 16:00'" });
    }

    // 4. Verify target studio exists in PostgreSQL
    const studio = await studioService.getStudioById(studioId.trim());
    if (!studio) {
      return res.status(404).json({ error: `Studio with id ${studioId} not found` });
    }

    // 5. Calculate total amount
    const hourlyRate = Number(studio.hourlyRate);
    const totalAmount = hourlyRate * parsedSlot.durationHours;

    // 6. Creator identity is strictly derived from verified JWT
    const creatorId = req.user.id;

    // 7. Execute reservation inside row-locked transaction
    const newBooking = await bookingService.createBookingWithLock({
      studioId: studio.id,
      creatorId: creatorId,
      startTime: parsedSlot.startTime,
      endTime: parsedSlot.endTime,
      totalAmount: totalAmount
    });

    return res.status(201).json({
      message: "Booking request submitted successfully and is pending provider confirmation.",
      booking: bookingService.formatBooking(newBooking)
    });
  } catch (err) {
    if (err.status === 409) {
      return res.status(409).json({ error: err.message });
    }
    next(err);
  }
}

// Unified Get Bookings: GET /api/bookings
async function getBookings(req, res, next) {
  try {
    const { role } = req.query;

    if (role === "provider" || req.query.providerId) {
      const bookings = await bookingService.getBookingsForProvider(req.user.id, req.query);
      return res.status(200).json(bookings);
    }

    const bookings = await bookingService.getBookingsForCreator(req.user.id, req.query);
    return res.status(200).json(bookings);
  } catch (err) {
    next(err);
  }
}

// Creator Bookings: GET /api/bookings/creator
async function getCreatorBookings(req, res, next) {
  try {
    const bookings = await bookingService.getBookingsForCreator(req.user.id, req.query);
    return res.status(200).json(bookings);
  } catch (err) {
    next(err);
  }
}

// Provider Bookings: GET /api/bookings/provider
async function getProviderBookings(req, res, next) {
  try {
    const bookings = await bookingService.getBookingsForProvider(req.user.id, req.query);
    return res.status(200).json(bookings);
  } catch (err) {
    next(err);
  }
}

// Get single booking details: GET /api/bookings/:id
async function getBooking(req, res, next) {
  try {
    const { id } = req.params;

    const booking = await bookingService.getBookingById(id);
    if (!booking) {
      return res.status(404).json({ error: `Booking with id ${id} not found` });
    }

    // Verify caller is either the booking creator or the studio host
    const isCreator = booking.creatorId === req.user.id;
    const isHost = booking.studio && booking.studio.providerId === req.user.id;

    if (!isCreator && !isHost) {
      return res.status(403).json({ error: "Access forbidden. You do not have permission to view this booking." });
    }

    return res.status(200).json({
      booking: bookingService.formatBooking(booking)
    });
  } catch (err) {
    next(err);
  }
}

// Provider Status Update: PATCH /api/bookings/:id/status
async function updateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || typeof status !== "string") {
      return res.status(400).json({ error: "A valid status is required." });
    }

    const targetStatus = status.trim().toUpperCase();
    const allowedStatuses = ["CONFIRMED", "REJECTED", "COMPLETED"];
    if (!allowedStatuses.includes(targetStatus)) {
      return res.status(400).json({ error: `Invalid booking status: ${status}. Must be one of: ${allowedStatuses.join(", ")}` });
    }

    // 1. Fetch booking
    const booking = await bookingService.getBookingById(id);
    if (!booking) {
      return res.status(404).json({ error: `Booking with id ${id} not found` });
    }

    // 2. Ownership check: verify caller is host of the booked studio
    if (!booking.studio || booking.studio.providerId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized: You do not own the studio for this booking." });
    }

    // 3. Lifecycle transition validation
    const currentStatus = booking.status;

    // Terminal statuses cannot transition further
    if (["REJECTED", "CANCELLED", "COMPLETED"].includes(currentStatus)) {
      return res.status(400).json({ error: `Cannot change status of a ${currentStatus} booking.` });
    }

    // From PENDING: can only go to CONFIRMED or REJECTED
    if (currentStatus === "PENDING" && !["CONFIRMED", "REJECTED"].includes(targetStatus)) {
      return res.status(400).json({ error: "Pending bookings can only be CONFIRMED or REJECTED." });
    }

    // From CONFIRMED: can only go to COMPLETED
    if (currentStatus === "CONFIRMED" && targetStatus !== "COMPLETED") {
      return res.status(400).json({ error: "Confirmed bookings can only transition to COMPLETED." });
    }

    // 4. Update status in database
    const updated = await bookingService.updateBookingStatus(id, targetStatus);

    return res.status(200).json({
      success: true,
      booking: updated
    });
  } catch (err) {
    next(err);
  }
}

// Creator Cancellation: PATCH /api/bookings/:id/cancel
async function cancelBooking(req, res, next) {
  try {
    const { id } = req.params;

    // 1. Fetch booking
    const booking = await bookingService.getBookingById(id);
    if (!booking) {
      return res.status(404).json({ error: `Booking with id ${id} not found` });
    }

    // 2. Ownership check: verify caller is the creator who placed this booking
    if (booking.creatorId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized: You can only cancel your own bookings." });
    }

    // 3. Validation: already cancelled or completed
    if (booking.status === "CANCELLED") {
      return res.status(400).json({ error: "This booking has already been cancelled." });
    }

    if (booking.status === "COMPLETED") {
      return res.status(400).json({ error: "Completed bookings cannot be cancelled." });
    }

    if (booking.status === "REJECTED") {
      return res.status(400).json({ error: "Rejected bookings cannot be cancelled." });
    }

    // 4. Cancel booking
    const updated = await bookingService.cancelBooking(id);

    return res.status(200).json({
      success: true,
      booking: updated
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createBooking,
  getBookings,
  getCreatorBookings,
  getProviderBookings,
  getBooking,
  updateStatus,
  cancelBooking
};
