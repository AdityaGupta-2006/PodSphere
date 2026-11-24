const express = require("express");
const router = express.Router();
const rentalController = require("../controllers/rental");
const authenticate = require("../middleware/authenticate");
const { requireProvider } = require("../middleware/authorize");

// Creator requests rental
router.post("/", authenticate, rentalController.createRental);

// List rentals (role-aware: ?role=provider or creator)
router.get("/", authenticate, rentalController.getRentals);

// Explicit endpoints
router.get("/creator", authenticate, rentalController.getCreatorRentals);
router.get("/provider", authenticate, requireProvider, rentalController.getProviderRentals);

// Single rental details
router.get("/:id", authenticate, rentalController.getRental);

// Provider update status
router.patch("/:id/status", authenticate, requireProvider, rentalController.updateStatus);

// Cancel rental
router.patch("/:id/cancel", authenticate, rentalController.cancelRental);

module.exports = router;
