const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(id) {
  return typeof id === "string" && UUID_REGEX.test(id.trim());
}

const VALID_CONDITIONS = ["NEW", "LIKE_NEW", "GOOD", "FAIR"];
const VALID_PRICING_UNITS = ["HOURLY", "DAILY"];

function validateEquipmentInput(body, isUpdate = false) {
  const errors = [];
  const {
    name,
    category,
    brand,
    model,
    description,
    condition,
    city,
    address,
    hourlyRate,
    dailyRate,
    pricingUnit,
    minimumRentalHours,
    maximumRentalHours,
    totalQuantity
  } = body;

  if (!isUpdate || name !== undefined) {
    if (!name || typeof name !== "string" || !name.trim()) {
      errors.push("Equipment name is required.");
    }
  }

  if (!isUpdate || category !== undefined) {
    if (!category || typeof category !== "string" || !category.trim()) {
      errors.push("Category is required.");
    }
  }

  if (!isUpdate || brand !== undefined) {
    if (!brand || typeof brand !== "string" || !brand.trim()) {
      errors.push("Brand is required.");
    }
  }

  if (!isUpdate || model !== undefined) {
    if (!model || typeof model !== "string" || !model.trim()) {
      errors.push("Model is required.");
    }
  }

  if (!isUpdate || description !== undefined) {
    if (!description || typeof description !== "string" || !description.trim()) {
      errors.push("Description is required.");
    }
  }

  if (condition !== undefined) {
    if (!VALID_CONDITIONS.includes(String(condition).toUpperCase())) {
      errors.push(`Condition must be one of: ${VALID_CONDITIONS.join(", ")}`);
    }
  }

  if (!isUpdate || city !== undefined) {
    if (!city || typeof city !== "string" || !city.trim()) {
      errors.push("City is required.");
    }
  }

  if (!isUpdate || address !== undefined) {
    if (!address || typeof address !== "string" || !address.trim()) {
      errors.push("Address is required.");
    }
  }

  if (pricingUnit !== undefined) {
    if (!VALID_PRICING_UNITS.includes(String(pricingUnit).toUpperCase())) {
      errors.push(`Pricing unit must be one of: ${VALID_PRICING_UNITS.join(", ")}`);
    }
  }

  // Handle hourlyRate: null or undefined means not specified; numbers must be positive
  let hasValidHourly = false;
  if (hourlyRate !== undefined && hourlyRate !== null && hourlyRate !== "") {
    const numHourly = Number(hourlyRate);
    if (!Number.isFinite(numHourly) || isNaN(numHourly) || numHourly <= 0) {
      errors.push("Hourly rate must be a valid positive number.");
    } else {
      hasValidHourly = true;
    }
  }

  // Handle dailyRate: null or undefined means not specified; numbers must be positive
  let hasValidDaily = false;
  if (dailyRate !== undefined && dailyRate !== null && dailyRate !== "") {
    const numDaily = Number(dailyRate);
    if (!Number.isFinite(numDaily) || isNaN(numDaily) || numDaily <= 0) {
      errors.push("Daily rate must be a valid positive number.");
    } else {
      hasValidDaily = true;
    }
  }

  const effectiveUnit = pricingUnit ? String(pricingUnit).toUpperCase() : "HOURLY";

  if (!isUpdate) {
    // On creation, at least one rate must be provided and valid
    if (!hasValidHourly && !hasValidDaily) {
      errors.push("At least one rental rate (hourlyRate or dailyRate) must be specified.");
    } else {
      // Ensure the selected pricingUnit has a usable rate
      if (effectiveUnit === "HOURLY" && !hasValidHourly) {
        errors.push("An hourly rate must be provided when pricing unit is HOURLY.");
      }
      if (effectiveUnit === "DAILY" && !hasValidDaily) {
        errors.push("A daily rate must be provided when pricing unit is DAILY.");
      }
    }
  } else {
    // On update, if pricingUnit is explicitly set, check that the rate is valid
    if (pricingUnit !== undefined) {
      if (effectiveUnit === "HOURLY" && hourlyRate !== undefined) {
        if (!hasValidHourly) {
          errors.push("An hourly rate must be provided when pricing unit is HOURLY.");
        }
      }
      if (effectiveUnit === "DAILY" && dailyRate !== undefined) {
        if (!hasValidDaily) {
          errors.push("A daily rate must be provided when pricing unit is DAILY.");
        }
      }
    }
  }

  if (totalQuantity !== undefined) {
    const qty = Number(totalQuantity);
    if (!Number.isInteger(qty) || qty < 1) {
      errors.push("Total quantity must be an integer of 1 or greater.");
    }
  }

  if (minimumRentalHours !== undefined) {
    const minHours = Number(minimumRentalHours);
    if (!Number.isInteger(minHours) || minHours < 1) {
      errors.push("Minimum rental hours must be an integer of 1 or greater.");
    }
  }

  if (maximumRentalHours !== undefined && maximumRentalHours !== null) {
    const maxHours = Number(maximumRentalHours);
    if (!Number.isInteger(maxHours) || maxHours < 1) {
      errors.push("Maximum rental hours must be a positive integer.");
    } else if (minimumRentalHours !== undefined && maxHours < Number(minimumRentalHours)) {
      errors.push("Maximum rental hours cannot be less than minimum rental hours.");
    }
  }

  return errors;
}

module.exports = {
  isValidUuid,
  VALID_CONDITIONS,
  VALID_PRICING_UNITS,
  validateEquipmentInput
};
