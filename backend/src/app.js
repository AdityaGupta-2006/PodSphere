"use strict";

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const env = require("./config/env");
const routes = require("./routes/index");
const errorHandler = require("./middleware/errorHandler");
const { apiLimiter } = require("./middleware/rateLimiter");

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Health Check (unauthenticated, before rate-limiter) ──────────────────────
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "PodSphere API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// ─── API Rate Limiter ─────────────────────────────────────────────────────────
app.use("/api", apiLimiter);

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/api", routes);

// ─── 404 Catch-all ───────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    status: "fail",
    code: "NOT_FOUND",
    message: `Route ${req.method} ${req.originalUrl} does not exist on this server.`,
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
