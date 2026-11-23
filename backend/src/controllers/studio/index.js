"use strict";

const asyncHandler = require("../../utils/asyncHandler");
const studioService = require("../../services/studio.service");

/**
 * GET /api/studios
 * Returns all studios with optional query filters.
 */
const getStudios = asyncHandler(async (req, res) => {
  const filters = {
    city: req.query.city,
    search: req.query.search,
    maxPrice: req.query.maxPrice,
    providerId: req.query.providerId,
  };

  const studios = await studioService.getStudios(filters);
  res.status(200).json({ status: "success", data: { studios } });
});

/**
 * GET /api/studios/:id
 * Returns a single studio by ID.
 */
const getStudioById = asyncHandler(async (req, res) => {
  const studio = await studioService.getStudioById(req.params.id);
  res.status(200).json({ status: "success", data: { studio } });
});

/**
 * POST /api/studios
 * Creates a new studio listing. Provider only.
 */
const createStudio = asyncHandler(async (req, res) => {
  const studio = await studioService.createStudio(req.user.id, req.body);
  res.status(201).json({
    status: "success",
    message: "Studio listing created.",
    data: { studio },
  });
});

/**
 * PUT /api/studios/:id
 * Updates a studio listing. Provider only, must own the studio.
 */
const updateStudio = asyncHandler(async (req, res) => {
  const studio = await studioService.updateStudio(req.params.id, req.user.id, req.body);
  res.status(200).json({
    status: "success",
    message: "Studio updated.",
    data: { studio },
  });
});

/**
 * DELETE /api/studios/:id
 * Deletes a studio listing. Provider only, must own the studio, no active bookings.
 */
const deleteStudio = asyncHandler(async (req, res) => {
  await studioService.deleteStudio(req.params.id, req.user.id);
  res.status(200).json({ status: "success", message: "Studio deleted." });
});

module.exports = { getStudios, getStudioById, createStudio, updateStudio, deleteStudio };
