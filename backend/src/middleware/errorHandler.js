function errorHandler(err, req, res, next) {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON payload provided." });
  }

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || "Internal server error.";

  if (statusCode === 500) {
    console.error("Unhandled error:", err);
  }

  return res.status(statusCode).json({
    error: message
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
