const express = require("express");
const router = express.Router();
const studioController = require("../controllers/studio");
const authenticate = require("../middleware/authenticate");
const { requireProvider } = require("../middleware/authorize");

// Public routes
router.get("/", studioController.listStudios);
router.get("/:id", studioController.getStudio);

// Protected provider routes
router.post("/", authenticate, requireProvider, studioController.createStudio);
router.put("/:id", authenticate, requireProvider, studioController.updateStudio);
router.delete("/:id", authenticate, requireProvider, studioController.deleteStudio);

module.exports = router;
