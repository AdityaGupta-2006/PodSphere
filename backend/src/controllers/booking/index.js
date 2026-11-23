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

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(rawDate.trim())) {
      return res.status(400).json({ error: "Invalid date format. Expected YYYY-MM-DD." });
    }

    const [year, month, day] = rawDate.trim().split("-").map(Number);
    const testDate = new Date(Date.UTC(year, month - 1, day));
    if (
      testDate.getUTCFullYear() !== year ||
      testDate.getUTCMonth() !== month - 1 ||
      testDate.getUTCDate() !== day
    ) {
      return res.status(400).json({ error: "Invalid calendar date." });
    }

    if (!time || typeof time !== "string" || !time.trim()) {
      return res.status(400).json({ error: "Time slot is required." });
    }

    // 2. Parse time slot into IST start and end Date objects
    const parsedSlot = parseTimeSlot(rawDate.trim(), time.trim());
    if (!parsedSlot) {
      return res.status(400).json({ error: "Invalid time slot format. Example: '10:00 AM - 12:00 PM' or '14:00 - 16:00'" });
    }

    // 3. Validate booking startTime is strictly in the future (including same-day slots)
    const now = new Date();
    if (parsedSlot.startTime <= now) {
      return res.status(400).json({ error: "Booking start time must be in the future." });
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

    const updated = await bookingService.updateBookingStatusAtomic({
      bookingId: id,
      targetStatus: targetStatus,
      providerId: req.user.id
    });

    return res.status(200).json({
      success: true,
      booking: updated
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    next(err);
  }
}

// Creator Cancellation: PATCH /api/bookings/:id/cancel
async function cancelBooking(req, res, next) {
  try {
    const { id } = req.params;

    const updated = await bookingService.cancelBookingAtomic({
      bookingId: id,
      creatorId: req.user.id
    });

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully. Payment will be refunded.",
      booking: updated
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
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
