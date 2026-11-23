"use strict";

const validate = require("../../middleware/validate");

/**
 * Validation schemas for booking endpoints.
 */

const createBookingSchema = {
  studioId: (v) => {
    if (!v || typeof v !== "string" || !v.trim()) return "Studio ID is required.";
    return null;
  },
  startTime: (v) => {
    if (!v) return "Start time is required.";
    const d = new Date(v);
    if (isNaN(d.getTime())) return "Start time must be a valid ISO 8601 date-time string.";
    if (d.getTime() <= Date.now()) return "Start time must be in the future.";
    return null;
  },
  endTime: (v, body) => {
    if (!v) return "End time is required.";
    const d = new Date(v);
    if (isNaN(d.getTime())) return "End time must be a valid ISO 8601 date-time string.";
    if (body.startTime) {
      const start = new Date(body.startTime);
      if (!isNaN(start.getTime()) && d.getTime() <= start.getTime()) {
        return "End time must be after start time.";
      }
      // Maximum single session: 12 hours.
      const diffHours = (d.getTime() - start.getTime()) / (1000 * 60 * 60);
      if (diffHours > 12) return "A single booking cannot exceed 12 hours.";
    }
    return null;
  },
};

const updateStatusSchema = {
  status: (v) => {
    const valid = ["PENDING", "CONFIRMED", "CANCELLED", "REJECTED", "COMPLETED"];
    if (!v) return "Status is required.";
    if (!valid.includes(String(v).toUpperCase())) {
      return `Status must be one of: ${valid.join(", ")}.`;
    }
    return null;
  },
};

module.exports = {
  validateCreateBooking: validate(createBookingSchema),
  validateUpdateStatus: validate(updateStatusSchema),
};
