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

// Update booking status (CONFIRMED, REJECTED, COMPLETED) with concurrency-safe row-locking check
async function updateBookingStatus(id, newStatus, expectedCurrentStatus) {
  return await prisma.$transaction(async (tx) => {
    // Acquire pessimistic row-level lock on the booking row to serialize concurrent status updates
    const rows = await tx.$queryRaw`SELECT id, status FROM "Booking" WHERE id = ${id}::uuid FOR UPDATE`;
    if (!rows || rows.length === 0) {
      const err = new Error(`Booking with id ${id} not found`);
      err.status = 404;
      throw err;
    }

    const current = rows[0];

    if (expectedCurrentStatus && current.status !== expectedCurrentStatus) {
      const err = new Error(
        `Booking status conflict: current status is ${current.status}, expected ${expectedCurrentStatus}. Another request has already changed the status.`
      );
      err.status = 409;
      throw err;
    }

    const updated = await tx.booking.update({
      where: { id: id },
      data: { status: newStatus },
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

// Cancel booking (creator action) with concurrency-safe row-locking check
async function cancelBooking(id, creatorId, expectedCurrentStatus) {
  return await prisma.$transaction(async (tx) => {
    // Acquire pessimistic row-level lock on the booking row to serialize concurrent cancel/status requests
    const rows = await tx.$queryRaw`SELECT id, "creatorId", status FROM "Booking" WHERE id = ${id}::uuid FOR UPDATE`;
    if (!rows || rows.length === 0) {
      const err = new Error(`Booking with id ${id} not found`);
      err.status = 404;
      throw err;
    }

    const current = rows[0];

    if (creatorId && current.creatorId !== creatorId) {
      const err = new Error("Unauthorized: You can only cancel your own bookings.");
      err.status = 403;
      throw err;
    }

    if (expectedCurrentStatus && current.status !== expectedCurrentStatus) {
      const err = new Error(
        `Booking status conflict: current status is ${current.status}, expected ${expectedCurrentStatus}. Another request has already changed the status.`
      );
      err.status = 409;
      throw err;
    }

    if (current.status === "CANCELLED") {
      const err = new Error("This booking has already been cancelled.");
      err.status = 400;
      throw err;
    }

    if (current.status === "COMPLETED") {
      const err = new Error("Completed bookings cannot be cancelled.");
      err.status = 400;
      throw err;
    }

    if (current.status === "REJECTED") {
      const err = new Error("Rejected bookings cannot be cancelled.");
      err.status = 400;
      throw err;
    }

    const updated = await tx.booking.update({
      where: { id: id },
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

module.exports = {
  isValidUuid,
  formatBooking,
  createBookingWithLock,
  getBookingsForCreator,
  getBookingsForProvider,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  updateBookingStatusAtomic: updateBookingStatus,
  cancelBookingAtomic: cancelBooking
};
