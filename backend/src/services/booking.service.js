const prisma = require("../db");
const { formatBookingTimes } = require("../utils/time");

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(id) {
  return typeof id === "string" && UUID_REGEX.test(id.trim());
}

// Format booking record into the exact structure expected by the frontend
function formatBooking(booking) {
  if (!booking) return null;

  const times = formatBookingTimes(booking.startTime, booking.endTime);
  const numAmount = Number(booking.totalAmount);
  const hourlyRate = booking.studio ? Number(booking.studio.hourlyRate) : 1500;

  let paymentStatus = "HOLD PENDING";
  if (booking.status === "CONFIRMED") paymentStatus = "PAID ESCROW";
  else if (booking.status === "COMPLETED") paymentStatus = "SETTLED";
  else if (booking.status === "CANCELLED") paymentStatus = "REFUNDED";
  else if (booking.status === "REJECTED") paymentStatus = "REJECTED";

  return {
    id: booking.id,
    studioId: booking.studioId,
    creatorId: booking.creatorId,
    studio: booking.studio ? booking.studio.name : "Recording Studio",
    studioName: booking.studio ? booking.studio.name : "Recording Studio",
    location: booking.studio
      ? `${booking.studio.city} • ${booking.studio.address}`
      : "Studio Control Room",
    city: booking.studio ? booking.studio.city : "Delhi",
    creatorName: booking.creator ? booking.creator.name : "Creator",
    creatorEmail: booking.creator ? booking.creator.email : "creator@podsphere.net",
    date: times.date,
    rawDate: times.rawDate,
    day: times.day,
    time: times.time,
    duration: times.duration,
    rate: `₹${hourlyRate.toLocaleString()}/hr rack rate`,
    amount: `₹${numAmount.toLocaleString()}`,
    rawAmount: numAmount,
    totalPrice: numAmount,
    startTime: booking.startTime,
    endTime: booking.endTime,
    status: booking.status,
    paymentStatus: paymentStatus,
    icon: "mic",
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt
  };
}

// Create a booking with pessimistic row-locking on the Studio row to serialize concurrent requests
async function createBookingWithLock({ studioId, creatorId, startTime, endTime, totalAmount }) {
  return await prisma.$transaction(async (tx) => {
    // 1. Acquire pessimistic row lock on the Studio to serialize concurrent reservation requests
    const studioRows = await tx.$queryRaw`SELECT id, "isArchived" FROM "Studio" WHERE id = ${studioId}::uuid FOR UPDATE`;
    if (!studioRows || studioRows.length === 0 || studioRows[0].isArchived) {
      const err = new Error(`Studio with id ${studioId} not found or is no longer available.`);
      err.status = 404;
      throw err;
    }

    // 2. Check for overlapping reservations for this studio in active states (PENDING or CONFIRMED)
    const conflict = await tx.booking.findFirst({
      where: {
        studioId: studioId,
        status: {
          in: ["PENDING", "CONFIRMED"]
        },
        startTime: {
          lt: endTime
        },
        endTime: {
          gt: startTime
        }
      }
    });

    if (conflict) {
      const err = new Error("This studio is already booked for the selected date and time window.");
      err.status = 409;
      throw err;
    }

    // 3. Insert new booking with PENDING status
    const newBooking = await tx.booking.create({
      data: {
        studioId: studioId,
        creatorId: creatorId,
        startTime: startTime,
        endTime: endTime,
        totalAmount: totalAmount,
        status: "PENDING"
      },
      include: {
        studio: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return newBooking;
  });
}

// Fetch bookings created by a specific creator
async function getBookingsForCreator(creatorId, filters = {}) {
  const where = {
    creatorId: creatorId
  };

  if (filters.status && filters.status !== "ALL" && filters.status !== "All Statuses") {
    where.status = filters.status.toUpperCase();
  }

  if (filters.studioId && filters.studioId !== "ALL" && isValidUuid(filters.studioId)) {
    where.studioId = filters.studioId;
  }

  const bookings = await prisma.booking.findMany({
    where: where,
    include: {
      studio: true,
      creator: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      startTime: "desc"
    }
  });

  return bookings.map(formatBooking);
}

// Fetch incoming bookings for studios owned by a specific provider
async function getBookingsForProvider(providerId, filters = {}) {
  const where = {
    studio: {
      providerId: providerId
    }
  };

  if (filters.status && filters.status !== "ALL" && filters.status !== "All Statuses") {
    where.status = filters.status.toUpperCase();
  }

  if (filters.studioId && filters.studioId !== "ALL" && isValidUuid(filters.studioId)) {
    where.studioId = filters.studioId;
  }

  const bookings = await prisma.booking.findMany({
    where: where,
    include: {
      studio: true,
      creator: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      startTime: "desc"
    }
  });

  return bookings.map(formatBooking);
}

// Fetch a single booking by ID
async function getBookingById(id) {
  if (!isValidUuid(id)) return null;

  return await prisma.booking.findUnique({
    where: {
      id: id
    },
    include: {
      studio: true,
      creator: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });
}

// Atomically update booking status with pessimistic row lock and lifecycle validation
async function updateBookingStatusAtomic({ bookingId, targetStatus, providerId }) {
  if (!isValidUuid(bookingId)) {
    const err = new Error(`Booking with id ${bookingId} not found`);
    err.status = 404;
    throw err;
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Acquire pessimistic row lock on the Booking
    const rows = await tx.$queryRaw`SELECT id FROM "Booking" WHERE id = ${bookingId}::uuid FOR UPDATE`;
    if (!rows || rows.length === 0) {
      const err = new Error(`Booking with id ${bookingId} not found`);
      err.status = 404;
      throw err;
    }

    // 2. Fetch booking record with relations inside transaction
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: {
        studio: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!booking) {
      const err = new Error(`Booking with id ${bookingId} not found`);
      err.status = 404;
      throw err;
    }

    // 3. Ownership check: verify provider owns the studio for this booking
    if (providerId && (!booking.studio || booking.studio.providerId !== providerId)) {
      const err = new Error("Unauthorized: You do not own the studio for this booking.");
      err.status = 403;
      throw err;
    }

    // 4. Lifecycle transition validation
    const currentStatus = booking.status;
    if (["REJECTED", "CANCELLED", "COMPLETED"].includes(currentStatus)) {
      const err = new Error(`Cannot change status of a ${currentStatus} booking.`);
      err.status = 400;
      throw err;
    }

    if (currentStatus === "PENDING" && !["CONFIRMED", "REJECTED"].includes(targetStatus)) {
      const err = new Error("Pending bookings can only be CONFIRMED or REJECTED.");
      err.status = 400;
      throw err;
    }

    if (currentStatus === "CONFIRMED" && targetStatus !== "COMPLETED") {
      const err = new Error("Confirmed bookings can only transition to COMPLETED.");
      err.status = 400;
      throw err;
    }

    // 5. Update status
    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: { status: targetStatus },
      include: {
        studio: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return formatBooking(updated);
  });
}

// Atomically cancel booking (creator action) with pessimistic row lock and lifecycle validation
async function cancelBookingAtomic({ bookingId, creatorId }) {
  if (!isValidUuid(bookingId)) {
    const err = new Error(`Booking with id ${bookingId} not found`);
    err.status = 404;
    throw err;
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Acquire pessimistic row lock on the Booking
    const rows = await tx.$queryRaw`SELECT id FROM "Booking" WHERE id = ${bookingId}::uuid FOR UPDATE`;
    if (!rows || rows.length === 0) {
      const err = new Error(`Booking with id ${bookingId} not found`);
      err.status = 404;
      throw err;
    }

    // 2. Fetch booking record inside transaction
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: {
        studio: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!booking) {
      const err = new Error(`Booking with id ${bookingId} not found`);
      err.status = 404;
      throw err;
    }

    // 3. Ownership check: verify caller is the creator
    if (creatorId && booking.creatorId !== creatorId) {
      const err = new Error("Unauthorized: You can only cancel your own bookings.");
      err.status = 403;
      throw err;
    }

    // 4. Lifecycle transition validation
    if (booking.status === "CANCELLED") {
      const err = new Error("This booking has already been cancelled.");
      err.status = 400;
      throw err;
    }

    if (booking.status === "COMPLETED") {
      const err = new Error("Completed bookings cannot be cancelled.");
      err.status = 400;
      throw err;
    }

    if (booking.status === "REJECTED") {
      const err = new Error("Rejected bookings cannot be cancelled.");
      err.status = 400;
      throw err;
    }

    // 5. Update status
    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
      include: {
        studio: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return formatBooking(updated);
  });
}

// Update booking status (backward-compatibility wrapper)
async function updateBookingStatus(id, newStatus) {
  return await updateBookingStatusAtomic({ bookingId: id, targetStatus: newStatus });
}

// Cancel booking (backward-compatibility wrapper)
async function cancelBooking(id) {
  return await cancelBookingAtomic({ bookingId: id });
}

module.exports = {
  isValidUuid,
  formatBooking,
  createBookingWithLock,
  getBookingsForCreator,
  getBookingsForProvider,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  updateBookingStatusAtomic,
  cancelBookingAtomic
};
