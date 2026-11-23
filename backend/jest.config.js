"use strict";

/** @type {import('jest').Config} */
const config = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.js"],
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/server.js",      // Entry point — not unit-testable without a live DB.
    "!src/prisma/client.js", // Singleton — tested indirectly via services.
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
  verbose: true,
};

module.exports = config;
