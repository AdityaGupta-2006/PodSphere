"use strict";

const validate = require("../../middleware/validate");

/**
 * Validation schemas for studio endpoints.
 */

const studioSchema = {
  name: (v) => {
    if (!v || typeof v !== "string" || !v.trim()) return "Studio name is required.";
    if (v.trim().length > 150) return "Studio name must not exceed 150 characters.";
    return null;
  },
  city: (v) => {
    if (!v || typeof v !== "string" || !v.trim()) return "City is required.";
    return null;
  },
  address: (v) => {
    if (!v || typeof v !== "string" || !v.trim()) return "Address is required.";
    return null;
  },
  hourlyRate: (v) => {
    const num = Number(v);
    if (v === undefined || v === null || v === "") return "Hourly rate is required.";
    if (isNaN(num) || num <= 0) return "Hourly rate must be a positive number.";
    if (num > 1000000) return "Hourly rate value is unreasonably large.";
    return null;
  },
  description: (v) => {
    if (!v || typeof v !== "string" || !v.trim()) return "Description is required.";
    if (v.trim().length > 2000) return "Description must not exceed 2000 characters.";
    return null;
  },
};

const updateStudioSchema = {
  ...studioSchema,
  // For updates, description is optional.
  description: (v) => {
    if (v !== undefined && v !== null && v !== "" && v.trim().length > 2000) {
      return "Description must not exceed 2000 characters.";
    }
    return null;
  },
};

module.exports = {
  validateCreateStudio: validate(studioSchema),
  validateUpdateStudio: validate(updateStudioSchema),
};
