function validateBooking(body) {
  if (!body) return "Request body is required";
  return null;
}

module.exports = { validateBooking };
