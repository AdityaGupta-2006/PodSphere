"use strict";

/**
 * Singleton Prisma Client instance.
 * Re-uses the existing client in development hot-reload scenarios
 * by caching it on the global object.
 */

const { PrismaClient } = require("../generated/prisma");

const globalForPrisma = global;

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
