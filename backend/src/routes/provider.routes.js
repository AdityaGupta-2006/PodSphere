const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/booking");
const equipmentController = require("../controllers/equipment");
const rentalController = require("../controllers/rental");
const authenticate = require("../middleware/authenticate");
const { requireProvider } = require("../middleware/authorize");

// Dedicated provider console endpoints
router.get("/bookings", authenticate, requireProvider, bookingController.getProviderBookings);
router.patch("/bookings/:id/status", authenticate, requireProvider, bookingController.updateStatus);

router.get("/equipment", authenticate, requireProvider, equipmentController.getProviderEquipment);
router.get("/rentals", authenticate, requireProvider, rentalController.getProviderRentals);
router.patch("/rentals/:id/status", authenticate, requireProvider, rentalController.updateStatus);

module.exports = router;
