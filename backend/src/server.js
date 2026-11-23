"use strict";

require("dotenv").config();

const app = require("./app");
const env = require("./config/env");
const prisma = require("./prisma/client");

const PORT = env.PORT;

async function start() {
  try {
    // Verify the database connection before accepting traffic.
    await prisma.$connect();
    console.log("[server] Database connection established.");

    app.listen(PORT, () => {
      console.log(
        `[server] PodSphere API running on http://localhost:${PORT}  (NODE_ENV=${env.NODE_ENV})`
      );
    });
  } catch (err) {
    console.error("[server] Failed to start:", err.message);
    await prisma.$disconnect().catch(() => {});
    process.exit(1);
  }
}

// Graceful shutdown on SIGTERM / SIGINT (e.g. Ctrl+C or container stop).
async function shutdown(signal) {
  console.log(`\n[server] Received ${signal}. Shutting down gracefully...`);
  await prisma.$disconnect().catch(() => {});
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

start();
