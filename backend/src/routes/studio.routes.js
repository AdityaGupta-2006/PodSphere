"use strict";

const { Router } = require("express");
const { validateCreateStudio, validateUpdateStudio } = require("../validators/studio/index");
const {
  getStudios,
  getStudioById,
  createStudio,
  updateStudio,
  deleteStudio,
} = require("../controllers/studio/index");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

const router = Router();

/** GET /api/studios — public, supports ?city, ?search, ?maxPrice, ?providerId */
router.get("/", getStudios);

/** GET /api/studios/:id — public */
router.get("/:id", getStudioById);

/** POST /api/studios — PROVIDER only */
router.post("/", authenticate, authorize("PROVIDER"), validateCreateStudio, createStudio);

/** PUT /api/studios/:id — PROVIDER only, must own the studio */
router.put("/:id", authenticate, authorize("PROVIDER"), validateUpdateStudio, updateStudio);

/** DELETE /api/studios/:id — PROVIDER only, must own the studio */
router.delete("/:id", authenticate, authorize("PROVIDER"), deleteStudio);

module.exports = router;
