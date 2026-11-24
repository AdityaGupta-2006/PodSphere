const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(id) {
  return typeof id === "string" && UUID_REGEX.test(id.trim());
}

const VALID_RENTAL_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
  "ACTIVE",
  "RETURNED",
  "COMPLETED"
];

const ALLOWED_STATUS_TRANSITIONS = {
  PENDING: ["APPROVED", "REJECTED", "CANCELLED"],
  APPROVED: ["ACTIVE", "CANCELLED", "REJECTED"],
  ACTIVE: ["RETURNED", "COMPLETED"],
  RETURNED: ["COMPLETED"],
  REJECTED: [],
  CANCELLED: [],
  COMPLETED: []
};

function parseAndValidateRentalDates(startTimeStr, endTimeStr) {
  const errors = [];

  if (!startTimeStr) {
    errors.push("Rental start time is required.");
  }
  if (!endTimeStr) {
    errors.push("Rental end time is required.");
  }
  if (errors.length > 0) return { errors };

  const start = new Date(startTimeStr);
  const end = new Date(endTimeStr);

  if (isNaN(start.getTime())) {
    errors.push("Invalid rental start date/time format.");
  }
  if (isNaN(end.getTime())) {
    errors.push("Invalid rental end date/time format.");
  }
  if (errors.length > 0) return { errors };

  const now = new Date();
  if (start <= now) {
    errors.push("Rental start time must be in the future.");
  }

  if (end <= start) {
    errors.push("Rental end time must be after start time.");
  }

  return {
    errors,
    startTime: start,
    endTime: end
  };
}

function validateRentalRequestInput(body) {
  const errors = [];
  const equipmentId = body.equipmentId;
  const startTime = body.startTime || body.startDate;
  const endTime = body.endTime || body.endDate;
  const quantity = body.quantity;

  if (!equipmentId || !isValidUuid(equipmentId)) {
    errors.push("A valid equipmentId is required.");
  }

  const dateValidation = parseAndValidateRentalDates(startTime, endTime);
  if (dateValidation.errors.length > 0) {
    errors.push(...dateValidation.errors);
  }

  let qty = 1;
  if (quantity !== undefined) {
    qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1) {
      errors.push("Rental quantity must be a positive integer (minimum 1).");
    }
  }

  return {
    errors,
    data: {
      equipmentId,
      startTime: dateValidation.startTime,
      endTime: dateValidation.endTime,
      quantity: qty,
      notes: body.notes ? String(body.notes).trim() : null
    }
  };
}

module.exports = {
  isValidUuid,
  VALID_RENTAL_STATUSES,
  ALLOWED_STATUS_TRANSITIONS,
  parseAndValidateRentalDates,
  validateRentalRequestInput
};
