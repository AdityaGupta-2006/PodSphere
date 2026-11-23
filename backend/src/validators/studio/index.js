function validateStudio(body) {
  if (!body) return "Request body is required";
  return null;
}

module.exports = { validateStudio };
