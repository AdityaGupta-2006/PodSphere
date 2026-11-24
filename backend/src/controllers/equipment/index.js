const equipmentService = require("../../services/equipment.service");
const { validateEquipmentInput, isValidUuid } = require("../../validators/equipment");
const { verifyToken } = require("../../utils/jwt");

// List all equipment with optional filtering: GET /api/equipment
async function listEquipment(req, res, next) {
  try {
    const { category, city, search, minPrice, maxPrice, pricingUnit, condition, sortBy, providerId, page, limit } = req.query;

    const equipment = await equipmentService.getAllEquipment({
      category,
      city,
      search,
      minPrice,
      maxPrice,
      pricingUnit,
      condition,
      sortBy,
      providerId,
      page,
      limit
    });

    return res.status(200).json(equipment);
  } catch (err) {
    next(err);
  }
}

// Get single equipment details: GET /api/equipment/:id
async function getEquipment(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidUuid(id)) {
      return res.status(404).json({ error: `Equipment with id ${id} not found` });
    }

    // Check if caller is authenticated and authorized as the equipment host
    let isAuthorizedHost = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = verifyToken(token);
        if (decoded && decoded.userId) {
          const item = await equipmentService.getEquipmentById(id, true);
          if (item && item.providerId === decoded.userId) {
            isAuthorizedHost = true;
          }
        }
      } catch {
        // Token invalid or expired - treat as unauthenticated
      }
    }

    const equipment = await equipmentService.getEquipmentById(id, isAuthorizedHost);
    if (!equipment || equipment.isArchived) {
      return res.status(404).json({ error: `Equipment with id ${id} not found` });
    }

    // Public callers cannot access inactive listings; only the authenticated owner can
    if (!equipment.isActive && !isAuthorizedHost) {
      return res.status(404).json({ error: `Equipment with id ${id} not found` });
    }

    return res.status(200).json({ equipment });
  } catch (err) {
    next(err);
  }
}

// Create new equipment listing: POST /api/equipment
async function createEquipment(req, res, next) {
  try {
    const errors = validateEquipmentInput(req.body, false);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors[0], errors });
    }

    const providerId = req.user.id;
    const created = await equipmentService.createEquipment(req.body, providerId);

    return res.status(201).json({
      message: "Equipment listed successfully.",
      equipment: created
    });
  } catch (err) {
    next(err);
  }
}

// Update existing equipment listing: PUT /api/equipment/:id
async function updateEquipment(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidUuid(id)) {
      return res.status(404).json({ error: `Equipment with id ${id} not found` });
    }

    const existing = await equipmentService.getEquipmentById(id, true);
    if (!existing) {
      return res.status(404).json({ error: `Equipment with id ${id} not found` });
    }

    if (existing.providerId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized: You can only update your own equipment." });
    }

    const errors = validateEquipmentInput(req.body, true);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors[0], errors });
    }

    // Validate effective rates on update
    const effectivePricingUnit = (req.body.pricingUnit || existing.pricingUnit || "HOURLY").toUpperCase();
    const effectiveHourly = req.body.hourlyRate !== undefined ? req.body.hourlyRate : existing.hourlyRate;
    const effectiveDaily = req.body.dailyRate !== undefined ? req.body.dailyRate : existing.dailyRate;

    if (effectivePricingUnit === "HOURLY" && (!effectiveHourly || Number(effectiveHourly) <= 0)) {
      return res.status(400).json({ error: "The selected pricing unit (HOURLY) requires a valid positive hourly rate." });
    }
    if (effectivePricingUnit === "DAILY" && (!effectiveDaily || Number(effectiveDaily) <= 0)) {
      return res.status(400).json({ error: "The selected pricing unit (DAILY) requires a valid positive daily rate." });
    }

    const updated = await equipmentService.updateEquipment(id, req.body);

    return res.status(200).json({
      message: "Equipment updated successfully.",
      equipment: updated
    });
  } catch (err) {
    next(err);
  }
}

// Delete or archive equipment listing: DELETE /api/equipment/:id
async function deleteEquipment(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidUuid(id)) {
      return res.status(404).json({ error: `Equipment with id ${id} not found` });
    }

    const existing = await equipmentService.getEquipmentById(id, true);
    if (!existing) {
      return res.status(404).json({ error: `Equipment with id ${id} not found` });
    }

    if (existing.providerId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized: You can only delete your own equipment." });
    }

    const hasActive = await equipmentService.hasActiveRentals(id);
    if (hasActive) {
      return res.status(400).json({
        error: "Cannot delete equipment with active or pending rentals. Complete or cancel active rentals first."
      });
    }

    const result = await equipmentService.deleteEquipment(id);

    return res.status(200).json({
      message: result.archived
        ? "Equipment listing has been archived because historical rental records exist."
        : "Equipment listing deleted successfully.",
      archived: result.archived,
      id
    });
  } catch (err) {
    next(err);
  }
}

// Provider equipment console: GET /api/provider/equipment
async function getProviderEquipment(req, res, next) {
  try {
    const providerId = req.user.id;
    const list = await equipmentService.getProviderEquipment(providerId, req.query);

    return res.status(200).json(list);
  } catch (err) {
    next(err);
  }
}

// Check equipment availability: GET /api/equipment/:id/availability?startTime=...&endTime=...
async function checkAvailability(req, res, next) {
  try {
    const { id } = req.params;
    const { startTime, endTime, startDate, endDate } = req.query;

    if (!isValidUuid(id)) {
      return res.status(404).json({ error: `Equipment with id ${id} not found` });
    }

    const startVal = startTime || startDate;
    const endVal = endTime || endDate;

    if (!startVal || !endVal) {
      return res.status(400).json({ error: "startTime and endTime query parameters are required." });
    }

    const start = new Date(startVal);
    const end = new Date(endVal);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: "Invalid date format provided for availability check." });
    }

    if (end <= start) {
      return res.status(400).json({ error: "End time must be after start time." });
    }

    const availability = await equipmentService.checkEquipmentAvailability(id, start, end);
    return res.status(200).json(availability);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listEquipment,
  getEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getProviderEquipment,
  checkAvailability
};
