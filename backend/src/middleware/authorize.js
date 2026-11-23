// Middleware to ensure the authenticated user has the PROVIDER role
function requireProvider(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Access denied. Authentication required." });
  }

  if (req.user.role !== "PROVIDER") {
    return res.status(403).json({ error: "Access forbidden. Provider role required." });
  }

  next();
}

// Middleware factory to enforce specific allowed roles
function requireRole(...allowedRoles) {
  return function (req, res, next) {
    if (!req.user) {
      return res.status(401).json({ error: "Access denied. Authentication required." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access forbidden. Insufficient permissions." });
    }

    next();
  };
}

module.exports = {
  requireProvider,
  requireRole
};
