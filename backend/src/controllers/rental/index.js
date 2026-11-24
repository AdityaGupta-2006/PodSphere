const rentalService = require("../../services/rental.service");
const { validateRentalRequestInput, isValidUuid, VALID_RENTAL_STATUSES } = require("../../validators/rental");

// Creator requests equipment rental: POST /api/rentals
async function createRental(req, res, next) {
  try {
    const validation = validateRentalRequestInput(req.body);
    if (validation.errors.length > 0) {
      return res.status(400).json({ error: validation.errors[0], errors: validation.errors });
    }

    const creatorId = req.user.id;
    const { equipmentId, startTime, endTime, quantity, notes } = validation.data;

    const rental = await rentalService.createRentalWithLock({
      equipmentId,
      creatorId,
      startTime,
      endTime,
      quantity,
      notes
    });

    return res.status(201).json({
      message: "Rental request submitted successfully. Pending provider confirmation.",
      rental
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    next(err);
  }
}

// Role-aware rental listing: GET /api/rentals
async function getRentals(req, res, next) {
  try {
    const role = (req.query.role || "").toLowerCase();

    if (role === "provider" || req.query.providerId) {
      const rentals = await rentalService.getRentalsForProvider(req.user.id, req.query);
      return res.status(200).json(rentals);
    }

    const rentals = await rentalService.getRentalsForCreator(req.user.id, req.query);
    return res.status(200).json(rentals);
  } catch (err) {
    next(err);
  }
}

// Creator rentals: GET /api/rentals/creator
async function getCreatorRentals(req, res, next) {
  try {
    const rentals = await rentalService.getRentalsForCreator(req.user.id, req.query);
    return res.status(200).json(rentals);
  } catch (err) {
    next(err);
  }
}

// Provider rentals: GET /api/rentals/provider
async function getProviderRentals(req, res, next) {
  try {
    const rentals = await rentalService.getRentalsForProvider(req.user.id, req.query);
    return res.status(200).json(rentals);
  } catch (err) {
    next(err);
  }
}

// Get single rental: GET /api/rentals/:id
async function getRental(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidUuid(id)) {
      return res.status(404).json({ error: `Rental with id ${id} not found` });
    }

    const rental = await rentalService.getRentalById(id);
    if (!rental) {
      return res.status(404).json({ error: `Rental with id ${id} not found` });
    }

    // Verify caller is either the creator or the provider
    const isCreator = rental.creatorId === req.user.id;
    const isProvider = rental.providerId === req.user.id;

    if (!isCreator && !isProvider) {
      return res.status(403).json({ error: "Access forbidden. You do not have permission to view this rental." });
    }

    return res.status(200).json({ rental });
  } catch (err) {
    next(err);
  }
}

// Update rental status (Provider action): PATCH /api/rentals/:id/status
async function updateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, expectedCurrentStatus } = req.body;

    if (!isValidUuid(id)) {
      return res.status(404).json({ error: `Rental with id ${id} not found` });
    }

    if (!status || typeof status !== "string") {
      return res.status(400).json({ error: "New rental status is required." });
    }

    const upperStatus = status.trim().toUpperCase();
    if (!VALID_RENTAL_STATUSES.includes(upperStatus)) {
      return res.status(400).json({ error: `Invalid status: ${status}. Must be one of ${VALID_RENTAL_STATUSES.join(", ")}` });
    }

    const updated = await rentalService.updateRentalStatus(id, upperStatus, expectedCurrentStatus, req.user.id);

    return res.status(200).json({
      message: `Rental status updated to ${upperStatus}.`,
      rental: updated
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    next(err);
  }
}

// Cancel rental: PATCH /api/rentals/:id/cancel
async function cancelRental(req, res, next) {
  try {
    const { id } = req.params;
    const { expectedCurrentStatus } = req.body;

    if (!isValidUuid(id)) {
      return res.status(404).json({ error: `Rental with id ${id} not found` });
    }

    const cancelled = await rentalService.cancelRental(id, req.user.id, expectedCurrentStatus);

    return res.status(200).json({
      message: "Rental request cancelled successfully.",
      rental: cancelled
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    next(err);
  }
}

module.exports = {
  createRental,
  getRentals,
  getCreatorRentals,
  getProviderRentals,
  getRental,
  updateStatus,
  cancelRental
};
