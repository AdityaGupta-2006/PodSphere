const prisma = require("../db");
const { isValidUuid, ALLOWED_STATUS_TRANSITIONS } = require("../validators/rental");

function formatRental(rental) {
  if (!rental) return null;

  const start = new Date(rental.startTime);
  const end = new Date(rental.endTime);

  const startFormatted = start.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

  const endFormatted = end.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

  const durationNum = Number(rental.duration);
  const durationText = rental.pricingUnit === "DAILY"
    ? `${durationNum} Day${durationNum > 1 ? "s" : ""}`
    : `${durationNum} Hour${durationNum > 1 ? "s" : ""}`;

  return {
    id: rental.id,
    equipmentId: rental.equipmentId,
    creatorId: rental.creatorId,
    providerId: rental.providerId,
    startTime: rental.startTime,
    endTime: rental.endTime,
    startDateFormatted: startFormatted,
    endDateFormatted: endFormatted,
    quantity: rental.quantity,
    rentalRate: Number(rental.rentalRate),
    pricingUnit: rental.pricingUnit,
    duration: durationNum,
    billableUnits: durationNum,
    durationText,
    totalAmount: Number(rental.totalAmount),
    totalPrice: Number(rental.totalAmount),
    totalAmountFormatted: `₹${Number(rental.totalAmount).toLocaleString("en-IN")}`,
    status: rental.status,
    notes: rental.notes || "",
    createdAt: rental.createdAt,
    updatedAt: rental.updatedAt,
    ...(rental.equipment
      ? {
          equipment: {
            id: rental.equipment.id,
            name: rental.equipment.name,
            category: rental.equipment.category,
            brand: rental.equipment.brand,
            model: rental.equipment.model,
            city: rental.equipment.city,
            address: rental.equipment.address,
            imageUrl: Array.isArray(rental.equipment.imageUrls) && rental.equipment.imageUrls.length > 0
              ? rental.equipment.imageUrls[0]
              : null
          }
        }
      : {}),
    ...(rental.creator
      ? {
          creator: {
            id: rental.creator.id,
            name: rental.creator.name,
            email: rental.creator.email
          }
        }
      : {}),
    ...(rental.provider
      ? {
          provider: {
            id: rental.provider.id,
            name: rental.provider.name,
            email: rental.provider.email
          }
        }
      : {})
  };
}

// Calculate server-side rental pricing
function calculateRentalPricing(equipment, startTime, endTime, quantity) {
  const durationMs = endTime.getTime() - startTime.getTime();
  const durationHoursExact = durationMs / (1000 * 60 * 60);

  if (equipment.minimumRentalHours && durationHoursExact < equipment.minimumRentalHours) {
    const err = new Error(`Rental duration must be at least ${equipment.minimumRentalHours} hour(s).`);
    err.status = 400;
    throw err;
  }

  if (equipment.maximumRentalHours && durationHoursExact > equipment.maximumRentalHours) {
    const err = new Error(`Rental duration cannot exceed ${equipment.maximumRentalHours} hour(s).`);
    err.status = 400;
    throw err;
  }

  const pricingUnit = equipment.pricingUnit || "HOURLY";
  let billableUnits = 0;
  let rate = 0;

  if (pricingUnit === "DAILY") {
    // Round up to full rental days (24 hour blocks)
    billableUnits = Math.max(1, Math.ceil(durationHoursExact / 24));
    rate = equipment.dailyRate !== null && equipment.dailyRate !== undefined
      ? Number(equipment.dailyRate)
      : Number(equipment.hourlyRate) * 24;
  } else {
    // Round up to nearest full hour
    billableUnits = Math.max(1, Math.ceil(durationHoursExact));
    rate = equipment.hourlyRate !== null && equipment.hourlyRate !== undefined
      ? Number(equipment.hourlyRate)
      : Number(equipment.dailyRate) / 24;
  }

  const totalAmount = Math.round(billableUnits * rate * quantity * 100) / 100;

  return {
    pricingUnit,
    duration: billableUnits,
    rentalRate: rate,
    totalAmount
  };
}

// Create rental request with pessimistic row locking and inventory concurrency protection
async function createRentalWithLock({ equipmentId, creatorId, startTime, endTime, quantity, notes }) {
  return await prisma.$transaction(async (tx) => {
    // 1. Acquire pessimistic row-level lock on the Equipment record
    const equipmentRows = await tx.$queryRaw`
      SELECT id, "providerId", "name", "totalQuantity", "hourlyRate", "dailyRate", "pricingUnit",
             "minimumRentalHours", "maximumRentalHours", "isActive", "isArchived"
      FROM "Equipment"
      WHERE id = ${equipmentId}::uuid
      FOR UPDATE
    `;

    if (!equipmentRows || equipmentRows.length === 0 || equipmentRows[0].isArchived) {
      const err = new Error(`Equipment with id ${equipmentId} not found or is no longer listed.`);
      err.status = 404;
      throw err;
    }

    const equipment = equipmentRows[0];

    if (!equipment.isActive) {
      const err = new Error("This equipment is currently inactive and not available for rental.");
      err.status = 400;
      throw err;
    }

    if (equipment.providerId === creatorId) {
      const err = new Error("Providers cannot rent their own equipment.");
      err.status = 400;
      throw err;
    }

    const requestedQty = Number(quantity) || 1;
    if (requestedQty > equipment.totalQuantity) {
      const err = new Error(
        `Requested quantity (${requestedQty}) exceeds total equipment inventory (${equipment.totalQuantity}).`
      );
      err.status = 400;
      throw err;
    }

    // 2. Query overlapping active reservations: (existing.startTime < requested.endTime AND existing.endTime > requested.startTime)
    const overlappingRentals = await tx.equipmentRental.findMany({
      where: {
        equipmentId: equipmentId,
        status: { in: ["PENDING", "APPROVED", "ACTIVE"] },
        startTime: { lt: endTime },
        endTime: { gt: startTime }
      },
      select: {
        id: true,
        quantity: true,
        status: true
      }
    });

    const reservedQuantity = overlappingRentals.reduce((sum, r) => sum + r.quantity, 0);
    const availableQuantity = equipment.totalQuantity - reservedQuantity;

    if (availableQuantity < requestedQty) {
      const err = new Error(
        `Insufficient equipment inventory: only ${Math.max(0, availableQuantity)} unit(s) available for the requested time period (${reservedQuantity} already reserved).`
      );
      err.status = 409;
      throw err;
    }

    // 3. Calculate authoritative server-side pricing
    const pricing = calculateRentalPricing(equipment, startTime, endTime, requestedQty);

    // 4. Create new EquipmentRental record with initial PENDING status
    const newRental = await tx.equipmentRental.create({
      data: {
        equipmentId,
        creatorId,
        providerId: equipment.providerId,
        startTime,
        endTime,
        quantity: requestedQty,
        rentalRate: pricing.rentalRate,
        pricingUnit: pricing.pricingUnit,
        duration: pricing.duration,
        totalAmount: pricing.totalAmount,
        status: "PENDING",
        notes: notes || null
      },
      include: {
        equipment: true,
        creator: {
          select: { id: true, name: true, email: true }
        },
        provider: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return formatRental(newRental);
  });
}

// Update rental status (e.g. APPROVED, REJECTED, ACTIVE, RETURNED, COMPLETED) with row lock
async function updateRentalStatus(id, newStatus, expectedCurrentStatus, callerId) {
  const upperStatus = newStatus.toUpperCase();

  return await prisma.$transaction(async (tx) => {
    // 1. Lock the rental row
    const rentalRows = await tx.$queryRaw`
      SELECT id, "equipmentId", "creatorId", "providerId", status, quantity, "startTime", "endTime"
      FROM "EquipmentRental"
      WHERE id = ${id}::uuid
      FOR UPDATE
    `;

    if (!rentalRows || rentalRows.length === 0) {
      const err = new Error(`Rental with id ${id} not found`);
      err.status = 404;
      throw err;
    }

    const currentRental = rentalRows[0];

    // Authorization: only the equipment provider can update status (except creator cancel handled in cancelRental)
    if (callerId && currentRental.providerId !== callerId) {
      const err = new Error("Unauthorized: Only the equipment provider can update rental status.");
      err.status = 403;
      throw err;
    }

    // Lifecycle validation
    const allowed = ALLOWED_STATUS_TRANSITIONS[currentRental.status] || [];
    if (!allowed.includes(upperStatus)) {
      const err = new Error(
        `Invalid status transition: cannot change status from ${currentRental.status} to ${upperStatus}.`
      );
      err.status = 400;
      throw err;
    }

    if (expectedCurrentStatus && currentRental.status !== expectedCurrentStatus) {
      const err = new Error(
        `Status conflict: current status is ${currentRental.status}, expected ${expectedCurrentStatus}. Another request already changed this rental.`
      );
      err.status = 409;
      throw err;
    }

    // 2. If approving, acquire equipment row lock and re-verify inventory hasn't been exhausted
    if (upperStatus === "APPROVED") {
      const equipmentRows = await tx.$queryRaw`
        SELECT id, "totalQuantity"
        FROM "Equipment"
        WHERE id = ${currentRental.equipmentId}::uuid
        FOR UPDATE
      `;
      const eq = equipmentRows[0];

      const overlapping = await tx.equipmentRental.findMany({
        where: {
          equipmentId: currentRental.equipmentId,
          id: { not: id },
          status: { in: ["APPROVED", "ACTIVE"] }, // already locked-in approved/active rentals
          startTime: { lt: currentRental.endTime },
          endTime: { gt: currentRental.startTime }
        },
        select: { quantity: true }
      });

      const alreadyCommitted = overlapping.reduce((sum, r) => sum + r.quantity, 0);
      if (eq.totalQuantity - alreadyCommitted < currentRental.quantity) {
        const err = new Error(
          `Cannot approve: insufficient inventory available during this time window. ${alreadyCommitted} of ${eq.totalQuantity} units are already approved/active.`
        );
        err.status = 409;
        throw err;
      }
    }

    // 3. Update status in database
    const updated = await tx.equipmentRental.update({
      where: { id },
      data: { status: upperStatus },
      include: {
        equipment: true,
        creator: { select: { id: true, name: true, email: true } },
        provider: { select: { id: true, name: true, email: true } }
      }
    });

    return formatRental(updated);
  });
}

// Cancel rental (creator action) with concurrency lock
async function cancelRental(id, callerId, expectedCurrentStatus) {
  return await prisma.$transaction(async (tx) => {
    const rentalRows = await tx.$queryRaw`
      SELECT id, "creatorId", "providerId", status
      FROM "EquipmentRental"
      WHERE id = ${id}::uuid
      FOR UPDATE
    `;

    if (!rentalRows || rentalRows.length === 0) {
      const err = new Error(`Rental with id ${id} not found`);
      err.status = 404;
      throw err;
    }

    const currentRental = rentalRows[0];

    // Check ownership: caller must be creator or provider
    if (callerId && currentRental.creatorId !== callerId && currentRental.providerId !== callerId) {
      const err = new Error("Unauthorized: You can only cancel your own rentals.");
      err.status = 403;
      throw err;
    }

    if (expectedCurrentStatus && currentRental.status !== expectedCurrentStatus) {
      const err = new Error(
        `Status conflict: current status is ${currentRental.status}, expected ${expectedCurrentStatus}.`
      );
      err.status = 409;
      throw err;
    }

    if (["CANCELLED", "REJECTED", "COMPLETED", "RETURNED", "ACTIVE"].includes(currentRental.status)) {
      const err = new Error(
        `Cannot cancel rental in '${currentRental.status}' status.`
      );
      err.status = 400;
      throw err;
    }

    const updated = await tx.equipmentRental.update({
      where: { id },
      data: { status: "CANCELLED" },
      include: {
        equipment: true,
        creator: { select: { id: true, name: true, email: true } },
        provider: { select: { id: true, name: true, email: true } }
      }
    });

    return formatRental(updated);
  });
}

// Get rentals for creator
async function getRentalsForCreator(creatorId, filters = {}) {
  const where = { creatorId };

  if (filters.status && filters.status !== "ALL" && filters.status !== "All Statuses") {
    where.status = filters.status.toUpperCase();
  }

  if (filters.equipmentId && isValidUuid(filters.equipmentId)) {
    where.equipmentId = filters.equipmentId;
  }

  const rentals = await prisma.equipmentRental.findMany({
    where,
    include: {
      equipment: true,
      creator: { select: { id: true, name: true, email: true } },
      provider: { select: { id: true, name: true, email: true } }
    },
    orderBy: { startTime: "desc" }
  });

  return rentals.map(formatRental);
}

// Get rentals for provider
async function getRentalsForProvider(providerId, filters = {}) {
  const where = { providerId };

  if (filters.status && filters.status !== "ALL" && filters.status !== "All Statuses") {
    where.status = filters.status.toUpperCase();
  }

  if (filters.equipmentId && isValidUuid(filters.equipmentId)) {
    where.equipmentId = filters.equipmentId;
  }

  const rentals = await prisma.equipmentRental.findMany({
    where,
    include: {
      equipment: true,
      creator: { select: { id: true, name: true, email: true } },
      provider: { select: { id: true, name: true, email: true } }
    },
    orderBy: { startTime: "desc" }
  });

  return rentals.map(formatRental);
}

// Get single rental by ID
async function getRentalById(id) {
  if (!isValidUuid(id)) return null;

  const rental = await prisma.equipmentRental.findUnique({
    where: { id },
    include: {
      equipment: true,
      creator: { select: { id: true, name: true, email: true } },
      provider: { select: { id: true, name: true, email: true } }
    }
  });

  return formatRental(rental);
}

module.exports = {
  formatRental,
  calculateRentalPricing,
  createRentalWithLock,
  updateRentalStatus,
  cancelRental,
  getRentalsForCreator,
  getRentalsForProvider,
  getRentalById
};
