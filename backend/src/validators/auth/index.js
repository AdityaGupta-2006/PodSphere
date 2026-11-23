function validateAuth(body) {
  if (!body) return "Request body is required";
  return null;
}

module.exports = { validateAuth };
