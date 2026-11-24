const { verifyToken } = require("../utils/jwt");
const prisma = require("../db");

// Verify Bearer JWT in the Authorization header
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (jwtErr) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }

  try {
    // Fetch fresh user record from PostgreSQL
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: "User not found or session invalid." });
    }

    req.user = user;
    next();
  } catch (dbErr) {
    // Forward database errors to errorHandler rather than reporting as token invalid
    next(dbErr);
  }
}

module.exports = authenticate;
