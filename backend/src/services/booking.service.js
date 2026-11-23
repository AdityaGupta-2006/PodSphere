"use strict";

const prisma = require("../../prisma/client");
const AppError = require("../../utils/AppError");
const { intervalsOverlap, calcTotalAmount } = require("../../utils/time");

/**
 * Returns bookings with optional filters.
 * Creators see only their own bookings. Providers see bookings for their studios.
 */
async function getBookings(requestingUser, filters = {}) {
  const where = {};

  if (requestingUser.role === "USER") {
    where.creatorId = requestingUser.id;
  } else if (requestingUser.role === "PROVIDER") {
    // Filter to bookings for this provider's studios.
    where.studio = { providerId: requestingUser.id };
    if (filters.studioId) {
      where.studioId = filters.studioId;
    }
  }

  if (filters.status && filters.status !== "ALL") {
    where.status = filters.status.toUpperCase();
  }

  return prisma.booking.findMany({
    where,
    orderBy: { startTime: "asc" },
    include: {
      studio: { select: { id: true, name: true, city: true, hourlyRate: true } },
      creator: { select: { id: true, name: true, email: true } },
    },
  });
}

/**
 * Returns a single booking by ID, checking ownership.
 */
async function getBookingById(id, requestingUser) {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      studio: { select: { id: true, name: true, city: true, address: true, hourlyRate: true, providerId: true } },
      creator: { select: { id: true, name: true, email: true } },
    },
  });

  if (!booking) throw AppError.notFound("Booking");

  const isCreator = booking.creatorId === requestingUser.id;
  const isProvider = booking.studio.providerId === requestingUser.id;

  if (!isCreator && !isProvider) {
    throw AppError.forbidden("You do not have access to this booking.");
  }

  return booking;
}

/**
 * Creates a new booking with server-side conflict detection.
 */
async function createBooking(creatorId, data) {
  const { studioId, startTime: startStr, endTime: endStr } = data;

  const studio = await prisma.studio.findUnique({ where: { id: studioId } });
  if (!studio) throw AppError.notFound("Studio");

  const startTime = new Date(startStr);
  const endTime = new Date(endStr);

  // Check for overlapping bookings at the same studio (database-level conflict check).
  const conflicts = await prisma.booking.findMany({
    where: {
      studioId,
      status: { in: ["CONFIRMED", "PENDING"] },
      AND: [{ startTime: { lt: endTime } }, { endTime: { gt: startTime } }],
    },
  });

  if (conflicts.length > 0) {
    throw AppError.conflict(
      "This studio is already booked for the selected time window. Please choose a different slot.",
      "BOOKING_CONFLICT"
    );
  }

  // Double-check with the utility function (additional safety layer).
  for (const conflict of conflicts) {
    if (intervalsOverlap(startTime, endTime, conflict.startTime, conflict.endTime)) {
      throw AppError.conflict(
        "This studio is already booked for the selected time window.",
        "BOOKING_CONFLICT"
      );
    }
  }

  const totalAmount = calcTotalAmount(studio.hourlyRate, startTime, endTime);

  return prisma.booking.create({
    data: {
      creatorId,
      studioId,
      startTime,
      endTime,
      totalAmount,
      status: "PENDING",
    },
    include: {
      studio: { select: { id: true, name: true, city: true, hourlyRate: true } },
      creator: { select: { id: true, name: true, email: true } },
    },
  });
}

/**
 * Cancels a booking. Only the creator who made it can cancel it.
 */
async function cancelBooking(id, creatorId) {
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) throw AppError.notFound("Booking");

  if (booking.creatorId !== creatorId) {
    throw AppError.forbidden("You can only cancel your own bookings.");
  }

  if (booking.status === "CANCELLED") {
    throw AppError.badRequest("This booking has already been cancelled.", "ALREADY_CANCELLED");
  }

  if (booking.status === "COMPLETED") {
    throw AppError.badRequest("Completed bookings cannot be cancelled.", "BOOKING_COMPLETED");
  }

  return prisma.booking.update({
    where: { id },
    data: { status: "CANCELLED" },
    include: {
      studio: { select: { id: true, name: true, city: true } },
    },
  });
}

/**
 * Updates a booking's status. Only the studio's provider can update status.
 */
async function updateBookingStatus(id, providerId, newStatus) {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { studio: { select: { providerId: true } } },
  });

  if (!booking) throw AppError.notFound("Booking");

  if (booking.studio.providerId !== providerId) {
    throw AppError.forbidden("You can only manage bookings for your own studios.");
  }

  const upper = newStatus.toUpperCase();

  // Validate allowed status transitions.
  const allowedFromPending = ["CONFIRMED", "REJECTED"];
  const allowedFromConfirmed = ["COMPLETED", "CANCELLED"];

  if (booking.status === "PENDING" && !allowedFromPending.includes(upper)) {
    throw AppError.badRequest(
      `Cannot transition from PENDING to ${upper}. Allowed: ${allowedFromPending.join(", ")}.`,
      "INVALID_STATUS_TRANSITION"
    );
  }

  if (booking.status === "CONFIRMED" && !allowedFromConfirmed.includes(upper)) {
    throw AppError.badRequest(
      `Cannot transition from CONFIRMED to ${upper}. Allowed: ${allowedFromConfirmed.join(", ")}.`,
      "INVALID_STATUS_TRANSITION"
    );
  }

  if (["CANCELLED", "REJECTED", "COMPLETED"].includes(booking.status)) {
    throw AppError.badRequest(
      `Booking with status ${booking.status} cannot be updated.`,
      "INVALID_STATUS_TRANSITION"
    );
  }

  return prisma.booking.update({
    where: { id },
    data: { status: upper },
    include: {
      studio: { select: { id: true, name: true } },
      creator: { select: { id: true, name: true } },
    },
  });
}

module.exports = { getBookings, getBookingById, createBooking, cancelBooking, updateBookingStatus };
