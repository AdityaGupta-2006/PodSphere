const prisma = require("../db");
const { isValidUuid } = require("../validators/equipment");

// Format equipment object: converts Decimal types to Numbers and standardizes provider representation
function formatEquipment(equipment, includeProviderEmail = false) {
  if (!equipment) return null;

  return {
    id: equipment.id,
    providerId: equipment.providerId,
    name: equipment.name,
    category: equipment.category,
    brand: equipment.brand,
    model: equipment.model,
    description: equipment.description || "",
    condition: equipment.condition,
    specifications: Array.isArray(equipment.specifications) ? equipment.specifications : [],
    city: equipment.city,
    address: equipment.address,
    hourlyRate: equipment.hourlyRate !== null ? Number(equipment.hourlyRate) : null,
    dailyRate: equipment.dailyRate !== null ? Number(equipment.dailyRate) : null,
    pricingUnit: equipment.pricingUnit,
    minimumRentalHours: equipment.minimumRentalHours,
    maximumRentalHours: equipment.maximumRentalHours,
    totalQuantity: equipment.totalQuantity,
    imageUrls: Array.isArray(equipment.imageUrls) ? equipment.imageUrls : [],
    imageUrl: Array.isArray(equipment.imageUrls) && equipment.imageUrls.length > 0 ? equipment.imageUrls[0] : null,
    isActive: equipment.isActive,
    isArchived: equipment.isArchived,
    createdAt: equipment.createdAt,
    updatedAt: equipment.updatedAt,
    ...(equipment.provider
      ? {
          provider: {
            id: equipment.provider.id,
            name: equipment.provider.name,
            ...(includeProviderEmail && equipment.provider.email ? { email: equipment.provider.email } : {})
          }
        }
      : {})
  };
}

// Public equipment listing with filtering, search, sorting, and pagination
async function getAllEquipment(filters = {}) {
  const where = {
    isArchived: false,
    isActive: true
  };

  if (filters.providerId && isValidUuid(filters.providerId)) {
    where.providerId = filters.providerId;
    // Allow provider to see their own inactive listings if requested
    if (filters.includeInactive === "true" || filters.includeInactive === true) {
      delete where.isActive;
    }
  }

  if (filters.category && filters.category !== "all" && filters.category !== "All Categories") {
    where.category = {
      equals: filters.category.trim(),
      mode: "insensitive"
    };
  }

  if (filters.city && filters.city !== "all" && filters.city !== "All Cities") {
    where.city = {
      equals: filters.city.trim(),
      mode: "insensitive"
    };
  }

  if (filters.condition && filters.condition !== "all") {
    where.condition = filters.condition.toUpperCase();
  }

  if (filters.pricingUnit && filters.pricingUnit !== "all") {
    where.pricingUnit = filters.pricingUnit.toUpperCase();
  }

  const min = filters.minPrice !== undefined && filters.minPrice !== "" && filters.minPrice !== null
    ? Number(filters.minPrice)
    : null;
  const max = filters.maxPrice !== undefined && filters.maxPrice !== "" && filters.maxPrice !== null
    ? Number(filters.maxPrice)
    : null;

  if (min !== null && (!Number.isFinite(min) || min < 0)) {
    const err = new Error("minPrice must be a valid non-negative number.");
    err.status = 400;
    throw err;
  }
  if (max !== null && (!Number.isFinite(max) || max < 0)) {
    const err = new Error("maxPrice must be a valid non-negative number.");
    err.status = 400;
    throw err;
  }
  if (min !== null && max !== null && min > max) {
    const err = new Error("minPrice cannot be greater than maxPrice.");
    err.status = 400;
    throw err;
  }

  if (min !== null || max !== null) {
    if (where.pricingUnit === "HOURLY") {
      where.hourlyRate = {
        ...(min !== null ? { gte: min } : {}),
        ...(max !== null ? { lte: max } : {})
      };
    } else if (where.pricingUnit === "DAILY") {
      where.dailyRate = {
        ...(min !== null ? { gte: min } : {}),
        ...(max !== null ? { lte: max } : {})
      };
    } else {
      const hourlyBranch = {
        pricingUnit: "HOURLY",
        hourlyRate: {
          ...(min !== null ? { gte: min } : {}),
          ...(max !== null ? { lte: max } : {})
        }
      };
      const dailyBranch = {
        pricingUnit: "DAILY",
        dailyRate: {
          ...(min !== null ? { gte: min } : {}),
          ...(max !== null ? { lte: max } : {})
        }
      };

      if (where.OR) {
        where.AND = [
          { OR: where.OR },
          { OR: [hourlyBranch, dailyBranch] }
        ];
        delete where.OR;
      } else {
        where.OR = [hourlyBranch, dailyBranch];
      }
    }
  }

  if (filters.search && filters.search.trim()) {
    const term = filters.search.trim();
    const searchConditions = [
      { name: { contains: term, mode: "insensitive" } },
      { brand: { contains: term, mode: "insensitive" } },
      { model: { contains: term, mode: "insensitive" } },
      { description: { contains: term, mode: "insensitive" } },
      { category: { contains: term, mode: "insensitive" } },
      { city: { contains: term, mode: "insensitive" } }
    ];

    if (where.AND) {
      where.AND.push({ OR: searchConditions });
    } else if (where.OR) {
      where.AND = [{ OR: where.OR }, { OR: searchConditions }];
      delete where.OR;
    } else {
      where.OR = searchConditions;
    }
  }

  let orderBy = { createdAt: "desc" };
  if (filters.sortBy === "price_asc") {
    orderBy = { hourlyRate: "asc" };
  } else if (filters.sortBy === "price_desc") {
    orderBy = { hourlyRate: "desc" };
  } else if (filters.sortBy === "name_asc") {
    orderBy = { name: "asc" };
  }

  const page = Math.max(1, parseInt(filters.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(filters.limit, 10) || 12));
  const skip = (page - 1) * limit;

  const [total, equipmentList] = await Promise.all([
    prisma.equipment.count({ where }),
    prisma.equipment.findMany({
      where,
      include: {
        provider: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy,
      skip,
      take: limit
    })
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    equipment: equipmentList.map((eq) => formatEquipment(eq, false)),
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  };
}

// Fetch single equipment listing by ID
async function getEquipmentById(id, includeProviderEmail = false) {
  if (!isValidUuid(id)) return null;

  const equipment = await prisma.equipment.findFirst({
    where: {
      id: id,
      isArchived: false
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

  return formatEquipment(equipment, includeProviderEmail);
}

// Create new equipment listing
async function createEquipment(data, providerId) {
  const images = Array.isArray(data.imageUrls) && data.imageUrls.length > 0
    ? data.imageUrls
    : (data.imageUrl ? [data.imageUrl] : []);

  const created = await prisma.equipment.create({
    data: {
      providerId: providerId,
      name: data.name.trim(),
      category: data.category.trim(),
      brand: data.brand.trim(),
      model: data.model.trim(),
      description: data.description.trim(),
      condition: data.condition ? data.condition.toUpperCase() : "GOOD",
      specifications: Array.isArray(data.specifications) ? data.specifications : [],
      city: data.city.trim(),
      address: data.address.trim(),
      hourlyRate: data.hourlyRate !== undefined && data.hourlyRate !== null ? Number(data.hourlyRate) : null,
      dailyRate: data.dailyRate !== undefined && data.dailyRate !== null ? Number(data.dailyRate) : null,
      pricingUnit: data.pricingUnit ? data.pricingUnit.toUpperCase() : "HOURLY",
      minimumRentalHours: data.minimumRentalHours ? Number(data.minimumRentalHours) : 1,
      maximumRentalHours: data.maximumRentalHours ? Number(data.maximumRentalHours) : null,
      totalQuantity: data.totalQuantity ? Number(data.totalQuantity) : 1,
      imageUrls: images,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      isArchived: false
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

  return formatEquipment(created, true);
}

// Update existing equipment listing with transactional row-locking and inventory safety
async function updateEquipment(id, updateData) {
  return await prisma.$transaction(async (tx) => {
    // 1. Acquire pessimistic row-level lock on the Equipment record
    const equipmentRows = await tx.$queryRaw`
      SELECT id, "totalQuantity", "providerId", "isArchived", "isActive"
      FROM "Equipment"
      WHERE id = ${id}::uuid
      FOR UPDATE
    `;

    if (!equipmentRows || equipmentRows.length === 0 || equipmentRows[0].isArchived) {
      const err = new Error(`Equipment with id ${id} not found or is no longer listed.`);
      err.status = 404;
      throw err;
    }

    const currentItem = equipmentRows[0];
    const data = {};

    if (updateData.name !== undefined) data.name = updateData.name.trim();
    if (updateData.category !== undefined) data.category = updateData.category.trim();
    if (updateData.brand !== undefined) data.brand = updateData.brand.trim();
    if (updateData.model !== undefined) data.model = updateData.model.trim();
    if (updateData.description !== undefined) data.description = updateData.description.trim();
    if (updateData.condition !== undefined) data.condition = updateData.condition.toUpperCase();
    if (updateData.city !== undefined) data.city = updateData.city.trim();
    if (updateData.address !== undefined) data.address = updateData.address.trim();
    if (updateData.pricingUnit !== undefined) data.pricingUnit = updateData.pricingUnit.toUpperCase();
    if (updateData.hourlyRate !== undefined) data.hourlyRate = updateData.hourlyRate !== null ? Number(updateData.hourlyRate) : null;
    if (updateData.dailyRate !== undefined) data.dailyRate = updateData.dailyRate !== null ? Number(updateData.dailyRate) : null;
    if (updateData.minimumRentalHours !== undefined) data.minimumRentalHours = Number(updateData.minimumRentalHours);
    if (updateData.maximumRentalHours !== undefined) data.maximumRentalHours = updateData.maximumRentalHours !== null ? Number(updateData.maximumRentalHours) : null;
    if (updateData.isActive !== undefined) data.isActive = Boolean(updateData.isActive);
    if (updateData.specifications !== undefined && Array.isArray(updateData.specifications)) {
      data.specifications = updateData.specifications;
    }
    if (updateData.imageUrls !== undefined && Array.isArray(updateData.imageUrls)) {
      data.imageUrls = updateData.imageUrls;
    } else if (updateData.imageUrl !== undefined) {
      data.imageUrls = [updateData.imageUrl];
    }

    // 2. Concurrency-safe inventory quantity check:
    // If totalQuantity is being updated, verify it does not fall below any peak overlapping active/pending rentals
    if (updateData.totalQuantity !== undefined) {
      const newQty = Number(updateData.totalQuantity);
      if (!Number.isInteger(newQty) || newQty < 1) {
        const err = new Error("Total quantity must be an integer of 1 or greater.");
        err.status = 400;
        throw err;
      }

      if (newQty < currentItem.totalQuantity) {
        const activeRentals = await tx.equipmentRental.findMany({
          where: {
            equipmentId: id,
            status: { in: ["PENDING", "APPROVED", "ACTIVE"] }
          },
          select: {
            startTime: true,
            endTime: true,
            quantity: true
          }
        });

        if (activeRentals.length > 0) {
          const events = [];
          for (const r of activeRentals) {
            events.push({ time: new Date(r.startTime).getTime(), delta: r.quantity });
            events.push({ time: new Date(r.endTime).getTime(), delta: -r.quantity });
          }
          events.sort((a, b) => a.time !== b.time ? a.time - b.time : a.delta - b.delta);

          let currentReserved = 0;
          let peakReserved = 0;
          for (const ev of events) {
            currentReserved += ev.delta;
            if (currentReserved > peakReserved) {
              peakReserved = currentReserved;
            }
          }

          if (newQty < peakReserved) {
            const err = new Error(
              `Cannot reduce total inventory to ${newQty}: active reservations require at least ${peakReserved} unit(s).`
            );
            err.status = 409;
            throw err;
          }
        }
      }

      data.totalQuantity = newQty;
    }

    const updated = await tx.equipment.update({
      where: { id },
      data,
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

    return formatEquipment(updated, true);
  });
}

// Check date-specific equipment availability
async function checkEquipmentAvailability(equipmentId, startTime, endTime) {
  if (!isValidUuid(equipmentId)) {
    const err = new Error(`Equipment with id ${equipmentId} not found`);
    err.status = 404;
    throw err;
  }

  const equipment = await prisma.equipment.findFirst({
    where: {
      id: equipmentId,
      isArchived: false
    },
    select: {
      id: true,
      name: true,
      totalQuantity: true,
      isActive: true,
      minimumRentalHours: true,
      maximumRentalHours: true
    }
  });

  if (!equipment) {
    const err = new Error(`Equipment with id ${equipmentId} not found`);
    err.status = 404;
    throw err;
  }

  if (!equipment.isActive) {
    return {
      equipmentId,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      totalQuantity: equipment.totalQuantity,
      reservedQuantity: 0,
      availableQuantity: 0,
      isAvailable: false,
      reason: "Equipment listing is currently inactive"
    };
  }

  const overlappingRentals = await prisma.equipmentRental.findMany({
    where: {
      equipmentId: equipmentId,
      status: { in: ["PENDING", "APPROVED", "ACTIVE"] },
      startTime: { lt: endTime },
      endTime: { gt: startTime }
    },
    select: {
      quantity: true
    }
  });

  const reservedQuantity = overlappingRentals.reduce((sum, r) => sum + r.quantity, 0);
  const availableQuantity = Math.max(0, equipment.totalQuantity - reservedQuantity);

  return {
    equipmentId,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    totalQuantity: equipment.totalQuantity,
    reservedQuantity,
    availableQuantity,
    isAvailable: availableQuantity > 0
  };
}

// Check if equipment has active rentals (PENDING, APPROVED, ACTIVE)
async function hasActiveRentals(equipmentId) {
  if (!isValidUuid(equipmentId)) return false;

  const count = await prisma.equipmentRental.count({
    where: {
      equipmentId: equipmentId,
      status: {
        in: ["PENDING", "APPROVED", "ACTIVE"]
      }
    }
  });

  return count > 0;
}

// Check if equipment has any historical rentals
async function hasRentalHistory(equipmentId) {
  if (!isValidUuid(equipmentId)) return false;

  const count = await prisma.equipmentRental.count({
    where: { equipmentId }
  });

  return count > 0;
}

// Delete equipment listing: if rentals exist, archives to preserve history; otherwise hard deletes
async function deleteEquipment(id) {
  const hasHistory = await hasRentalHistory(id);

  if (hasHistory) {
    const archived = await prisma.equipment.update({
      where: { id },
      data: {
        isArchived: true,
        isActive: false
      }
    });
    return { archived: true, equipment: formatEquipment(archived, false) };
  }

  const deleted = await prisma.equipment.delete({
    where: { id }
  });
  return { archived: false, id: deleted.id };
}

// Fetch equipment for a provider with active rental counts
async function getProviderEquipment(providerId, filters = {}) {
  const where = {
    providerId: providerId,
    isArchived: false
  };

  if (filters.category && filters.category !== "all") {
    where.category = filters.category;
  }

  const list = await prisma.equipment.findMany({
    where,
    include: {
      rentals: {
        where: {
          status: { in: ["PENDING", "APPROVED", "ACTIVE"] }
        },
        select: { id: true, status: true, quantity: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return list.map((eq) => {
    const formatted = formatEquipment(eq, true);
    const activeRentalCount = eq.rentals.length;
    const reservedQuantity = eq.rentals.reduce((sum, r) => sum + r.quantity, 0);
    return {
      ...formatted,
      activeRentalCount,
      reservedQuantity,
      availableQuantity: Math.max(0, formatted.totalQuantity - reservedQuantity)
    };
  });
}

module.exports = {
  isValidUuid,
  formatEquipment,
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  checkEquipmentAvailability,
  hasActiveRentals,
  hasRentalHistory,
  deleteEquipment,
  getProviderEquipment
};
