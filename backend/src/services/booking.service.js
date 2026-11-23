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
    await tx.$queryRaw`SELECT id FROM "Studio" WHERE id = ${studioId}::uuid FOR UPDATE`;

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

// Update booking status (CONFIRMED, REJECTED, COMPLETED)
async function updateBookingStatus(id, newStatus) {
  const updated = await prisma.booking.update({
    where: {
      id: id
    },
    data: {
      status: newStatus
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

  return formatBooking(updated);
}

// Cancel booking (creator action)
async function cancelBooking(id) {
  const updated = await prisma.booking.update({
    where: {
      id: id
    },
    data: {
      status: "CANCELLED"
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

  return formatBooking(updated);
}

module.exports = {
  isValidUuid,
  formatBooking,
  createBookingWithLock,
  getBookingsForCreator,
  getBookingsForProvider,
  getBookingById,
  updateBookingStatus,
  cancelBooking
};
