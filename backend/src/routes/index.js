const express = require("express");
const router = express.Router();
const prisma = require("../db");
const authRoutes = require("./auth.routes");
const studioRoutes = require("./studio.routes");
const bookingRoutes = require("./booking.routes");
const providerRoutes = require("./provider.routes");

// Health check endpoint
router.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({
      status: "ok",
      database: "connected",
      message: "PodSphere API and database are operational",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(503).json({
      status: "error",
      database: "disconnected",
      message: "Database unreachable",
      error: err.message
    });
  }
});

// Route modules
router.use("/auth", authRoutes);
router.use("/studios", studioRoutes);
router.use("/bookings", bookingRoutes);
router.use("/provider", providerRoutes);

module.exports = router;
