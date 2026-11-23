const studioService = require("../../services/studio.service");

// List all studios with optional filtering: GET /api/studios
async function listStudios(req, res, next) {
  try {
    const { city, search, maxPrice, providerId } = req.query;

    const studios = await studioService.getAllStudios({
      city,
      search,
      maxPrice,
      providerId
    });

    return res.status(200).json(studios);
  } catch (err) {
    next(err);
  }
}

// Get single studio details: GET /api/studios/:id
async function getStudio(req, res, next) {
  try {
    const { id } = req.params;

    const studio = await studioService.getStudioById(id);

    if (!studio) {
      return res.status(404).json({ error: `Studio with id ${id} not found` });
    }

    return res.status(200).json({ studio });
  } catch (err) {
    next(err);
  }
}

// Create new studio listing: POST /api/studios
async function createStudio(req, res, next) {
  try {
    const { name, city, address, hourlyRate, description, gear, equipment, imageUrl } = req.body;

    // 1. Validate required fields
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "Studio name is required." });
    }

    if (!city || typeof city !== "string" || !city.trim()) {
      return res.status(400).json({ error: "Studio city is required." });
    }

    if (!address || typeof address !== "string" || !address.trim()) {
      return res.status(400).json({ error: "Studio address is required." });
    }

    const rate = Number(hourlyRate);
    if (isNaN(rate) || rate <= 0) {
      return res.status(400).json({ error: "Hourly rate must be a valid positive number." });
    }

    if (!description || typeof description !== "string" || !description.trim()) {
      return res.status(400).json({ error: "Studio description is required." });
    }

    // 2. Normalize gear / equipment array
    const gearList = Array.isArray(gear)
      ? gear
      : Array.isArray(equipment)
      ? equipment
      : [];

    // 3. Derive provider identity strictly from verified JWT
    const providerId = req.user.id;

    // 4. Create studio record
    const studio = await studioService.createStudio({
      name: name.trim(),
      city: city.trim(),
      address: address.trim(),
      hourlyRate: rate,
      description: description.trim(),
      gear: gearList,
      imageUrl: imageUrl || null,
      providerId: providerId
    });

    return res.status(201).json({
      message: "Studio created successfully.",
      studio: studio
    });
  } catch (err) {
    next(err);
  }
}

// Update existing studio listing: PUT /api/studios/:id
async function updateStudio(req, res, next) {
  try {
    const { id } = req.params;

    // 1. Fetch existing studio to verify existence
    const existingStudio = await studioService.getStudioById(id);
    if (!existingStudio) {
      return res.status(404).json({ error: `Studio with id ${id} not found` });
    }

    // 2. Ownership check: strictly ensure the authenticated provider owns this studio
    if (existingStudio.providerId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized: You can only update your own studios." });
    }

    // 3. Validate fields if present in update payload
    const { name, city, address, hourlyRate, description, gear, equipment, imageUrl } = req.body;

    if (name !== undefined && (typeof name !== "string" || !name.trim())) {
      return res.status(400).json({ error: "Studio name cannot be empty." });
    }

    if (hourlyRate !== undefined) {
      const rate = Number(hourlyRate);
      if (isNaN(rate) || rate <= 0) {
        return res.status(400).json({ error: "Hourly rate must be a valid positive number." });
      }
    }

    const gearList = Array.isArray(gear)
      ? gear
      : Array.isArray(equipment)
      ? equipment
      : undefined;

    // 4. Update studio in database
    const updatedStudio = await studioService.updateStudio(id, {
      name,
      city,
      address,
      hourlyRate,
      description,
      gear: gearList,
      imageUrl
    });

    return res.status(200).json({
      message: "Studio updated successfully.",
      studio: updatedStudio
    });
  } catch (err) {
    next(err);
  }
}

// Delete studio listing: DELETE /api/studios/:id
async function deleteStudio(req, res, next) {
  try {
    const { id } = req.params;

    await studioService.deleteStudio(id, req.user.id);

    return res.status(200).json({
      success: true,
      message: "Studio deleted successfully."
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    next(err);
  }
}

module.exports = {
  listStudios,
  getStudio,
  createStudio,
  updateStudio,
  deleteStudio
};
