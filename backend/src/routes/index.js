"use strict";

const { Router } = require("express");

const authRoutes = require("./auth.routes");
const studioRoutes = require("./studio.routes");
const bookingRoutes = require("./booking.routes");
const providerRoutes = require("./provider.routes");

const router = Router();

router.use("/auth", authRoutes);
router.use("/studios", studioRoutes);
router.use("/bookings", bookingRoutes);
router.use("/provider", providerRoutes);

module.exports = router;
