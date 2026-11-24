const express = require("express");
const router = express.Router();
const equipmentController = require("../controllers/equipment");
const authenticate = require("../middleware/authenticate");
const { requireProvider } = require("../middleware/authorize");

// Public routes
router.get("/", equipmentController.listEquipment);
router.get("/provider", authenticate, requireProvider, equipmentController.getProviderEquipment);
router.get("/:id/availability", equipmentController.checkAvailability);
router.get("/:id", equipmentController.getEquipment);

// Protected provider routes
router.post("/", authenticate, requireProvider, equipmentController.createEquipment);
router.put("/:id", authenticate, requireProvider, equipmentController.updateEquipment);
router.delete("/:id", authenticate, requireProvider, equipmentController.deleteEquipment);

module.exports = router;
