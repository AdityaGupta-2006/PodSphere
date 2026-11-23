"use strict";

const prisma = require("../../prisma/client");
const AppError = require("../../utils/AppError");

/**
 * Returns all studios, with optional filtering.
 *
 * @param {{ city?: string, search?: string, maxPrice?: string, providerId?: string }} filters
 */
async function getStudios(filters = {}) {
  const where = {};

  if (filters.providerId) {
    where.providerId = filters.providerId;
  }

  if (filters.city && filters.city !== "all") {
    where.city = { equals: filters.city, mode: "insensitive" };
  }

  if (filters.search) {
    const q = filters.search.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
      { address: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  if (filters.maxPrice) {
    const max = Number(filters.maxPrice);
    if (!isNaN(max) && max > 0) {
      where.hourlyRate = { lte: max };
    }
  }

  return prisma.studio.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      city: true,
      address: true,
      hourlyRate: true,
      gear: true,
      providerId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

/**
 * Returns a single studio by ID, or throws 404.
 */
async function getStudioById(id) {
  const studio = await prisma.studio.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      city: true,
      address: true,
      hourlyRate: true,
      gear: true,
      providerId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!studio) throw AppError.notFound("Studio");
  return studio;
}

/**
 * Creates a new studio listing.
 */
async function createStudio(providerId, data) {
  const { name, city, address, hourlyRate, description, gear } = data;

  return prisma.studio.create({
    data: {
      name: name.trim(),
      city: city.trim(),
      address: address.trim(),
      hourlyRate: Number(hourlyRate),
      description: (description || "").trim(),
      gear: Array.isArray(gear) ? gear.filter((g) => typeof g === "string" && g.trim()) : [],
      providerId,
    },
    select: {
      id: true,
      name: true,
      description: true,
      city: true,
      address: true,
      hourlyRate: true,
      gear: true,
      providerId: true,
      createdAt: true,
    },
  });
}

/**
 * Updates an existing studio. Only the owning provider may update it.
 */
async function updateStudio(id, providerId, data) {
  const studio = await prisma.studio.findUnique({ where: { id } });
  if (!studio) throw AppError.notFound("Studio");

  if (studio.providerId !== providerId) {
    throw AppError.forbidden("You can only update studios you own.");
  }

  const { name, city, address, hourlyRate, description, gear } = data;

  return prisma.studio.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(city !== undefined && { city: city.trim() }),
      ...(address !== undefined && { address: address.trim() }),
      ...(hourlyRate !== undefined && { hourlyRate: Number(hourlyRate) }),
      ...(description !== undefined && { description: description.trim() }),
      ...(Array.isArray(gear) && {
        gear: gear.filter((g) => typeof g === "string" && g.trim()),
      }),
    },
    select: {
      id: true,
      name: true,
      description: true,
      city: true,
      address: true,
      hourlyRate: true,
      gear: true,
      providerId: true,
      updatedAt: true,
    },
  });
}

/**
 * Deletes a studio. Prevents deletion if active bookings exist.
 */
async function deleteStudio(id, providerId) {
  const studio = await prisma.studio.findUnique({ where: { id } });
  if (!studio) throw AppError.notFound("Studio");

  if (studio.providerId !== providerId) {
    throw AppError.forbidden("You can only delete studios you own.");
  }

  const activeBookings = await prisma.booking.count({
    where: {
      studioId: id,
      status: { in: ["CONFIRMED", "PENDING"] },
    },
  });

  if (activeBookings > 0) {
    throw AppError.badRequest(
      "This studio has active or pending bookings and cannot be deleted. Cancel all bookings first.",
      "STUDIO_HAS_ACTIVE_BOOKINGS"
    );
  }

  await prisma.studio.delete({ where: { id } });
}

module.exports = { getStudios, getStudioById, createStudio, updateStudio, deleteStudio };
