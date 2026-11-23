"use strict";

const { Router } = require("express");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const { getStudios } = require("../controllers/studio/index");
const { getBookings } = require("../controllers/booking/index");

/**
 * Provider-specific convenience routes.
 * These are thin wrappers that lock down endpoints to PROVIDER role only
 * and return data scoped to the authenticated provider.
 */
const router = Router();

router.use(authenticate, authorize("PROVIDER"));

/**
 * GET /api/provider/studios
 * Returns studios owned by the authenticated provider.
 */
router.get("/studios", (req, _res, next) => {
  req.query.providerId = req.user.id;
  next();
}, getStudios);

/**
 * GET /api/provider/bookings
 * Returns bookings for the authenticated provider's studios.
 */
router.get("/bookings", getBookings);

module.exports = router;
