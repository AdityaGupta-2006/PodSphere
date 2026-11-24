function isDatabaseConnectionError(err) {
  if (!err) return false;
  if (err.name === "PrismaClientInitializationError") return true;
  if (["P1001", "P1002", "P1003", "P1008", "P1017"].includes(err.code)) return true;
  const msg = err.message ? String(err.message) : "";
  return msg.includes("ECONNREFUSED") || msg.includes("Can't reach database server") || msg.includes("connection closed");
}

function errorHandler(err, req, res, next) {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON payload provided." });
  }

  // Handle database connection unavailability
  if (isDatabaseConnectionError(err)) {
    console.error("Database connection failure:", err.message || err);
    return res.status(503).json({
      error: "Database service is temporarily unavailable. Please try again shortly."
    });
  }

  const statusCode = err.status || err.statusCode || 500;

  if (statusCode === 500) {
    console.error("Unhandled internal server error:", err);
    return res.status(500).json({
      error: "An unexpected internal server error occurred."
    });
  }

  return res.status(statusCode).json({
    error: err.message || "Request failed."
  });
}

function notFoundHandler(req, res) {
  return res.status(404).json({
    error: `API route '${req.originalUrl}' not found.`
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
