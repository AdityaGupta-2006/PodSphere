const prisma = require("../db");

// UUID v4 format validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(id) {
  return typeof id === "string" && UUID_REGEX.test(id.trim());
}

// Format studio object to ensure Decimal is converted to Number and fields are consistent
function formatStudio(studio) {
  if (!studio) return null;

  const gearList = Array.isArray(studio.gear) ? studio.gear : [];

  return {
    id: studio.id,
    providerId: studio.providerId,
    name: studio.name,
    city: studio.city,
    address: studio.address,
    hourlyRate: Number(studio.hourlyRate),
    description: studio.description || "",
    gear: gearList,
    equipment: gearList, // frontend compatibility
    imageUrl: studio.imageUrl || null,
    createdAt: studio.createdAt,
    updatedAt: studio.updatedAt,
    ...(studio.provider
      ? {
          provider: {
            id: studio.provider.id,
            name: studio.provider.name,
            ...(studio.provider.email ? { email: studio.provider.email } : {})
          }
        }
      : {})
  };
}

// Fetch studios matching optional filters (public listing omits provider email)
async function getAllStudios(filters = {}) {
  const where = {};

  if (filters.providerId && isValidUuid(filters.providerId)) {
    where.providerId = filters.providerId;
  }

  if (filters.city && filters.city !== "all" && filters.city !== "All Cities") {
    where.city = {
      equals: filters.city.trim(),
      mode: "insensitive"
    };
  }

  if (filters.maxPrice) {
    const max = Number(filters.maxPrice);
    if (!isNaN(max) && max > 0) {
      where.hourlyRate = {
        lte: max
      };
    }
  }

  if (filters.search && filters.search.trim()) {
    const searchTerm = filters.search.trim();
    where.OR = [
      { name: { contains: searchTerm, mode: "insensitive" } },
      { city: { contains: searchTerm, mode: "insensitive" } },
      { address: { contains: searchTerm, mode: "insensitive" } },
      { description: { contains: searchTerm, mode: "insensitive" } }
    ];
  }

  const studios = await prisma.studio.findMany({
    where: where,
    include: {
      provider: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return studios.map(formatStudio);
}

// Fetch a single studio by ID
async function getStudioById(id) {
  if (!isValidUuid(id)) {
    return null;
  }

  const studio = await prisma.studio.findUnique({
    where: {
      id: id
    },
    include: {
      provider: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  return formatStudio(studio);
}

// Create a new recording studio in PostgreSQL
async function createStudio({ name, city, address, hourlyRate, description, gear, imageUrl, providerId }) {
  const gearArray = Array.isArray(gear) ? gear : [];

  const created = await prisma.studio.create({
    data: {
      name: name,
      city: city,
      address: address,
      hourlyRate: hourlyRate,
      description: description,
      gear: gearArray,
      imageUrl: imageUrl || null,
      providerId: providerId
    },
    include: {
      provider: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  return formatStudio(created);
}

// Update an existing studio in PostgreSQL
async function updateStudio(id, updateData) {
  const data = {};

  if (updateData.name !== undefined) data.name = updateData.name.trim();
  if (updateData.city !== undefined) data.city = updateData.city.trim();
  if (updateData.address !== undefined) data.address = updateData.address.trim();
  if (updateData.hourlyRate !== undefined) data.hourlyRate = Number(updateData.hourlyRate);
  if (updateData.description !== undefined) data.description = updateData.description.trim();
  if (updateData.gear !== undefined && Array.isArray(updateData.gear)) data.gear = updateData.gear;
  if (updateData.imageUrl !== undefined) data.imageUrl = updateData.imageUrl;

  const updated = await prisma.studio.update({
    where: {
      id: id
    },
    data: data,
    include: {
      provider: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  return formatStudio(updated);
}

// Check if a studio has any active or pending bookings
async function hasActiveBookings(studioId) {
  if (!isValidUuid(studioId)) return false;

  const count = await prisma.booking.count({
    where: {
      studioId: studioId,
      status: {
        in: ["PENDING", "CONFIRMED"]
      }
    }
  });

  return count > 0;
}

// Check if a studio has any bookings at all (including historical completed/cancelled/rejected)
async function hasBookingHistory(studioId) {
  if (!isValidUuid(studioId)) return false;

  const count = await prisma.booking.count({
    where: {
      studioId: studioId
    }
  });

  return count > 0;
}

// Delete a studio from PostgreSQL without purging historical booking records
async function deleteStudio(id) {
  return await prisma.studio.delete({
    where: {
      id: id
    }
  });
}

module.exports = {
  isValidUuid,
  formatStudio,
  getAllStudios,
  getStudioById,
  createStudio,
  updateStudio,
  hasActiveBookings,
  hasBookingHistory,
  deleteStudio
};
