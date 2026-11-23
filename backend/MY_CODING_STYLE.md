# PodSphere Backend Coding Style & Architecture Guide

> **Semester 3 Application Programming Reference**  
> This document defines the exact backend coding style, architectural patterns, conventions, and rules for the PodSphere project. All future backend implementation must follow this document to ensure code remains simple, readable, student-appropriate, and easy to explain during college project reviews.

---

## 1. General Philosophy & Approach

### College-Taught, Student-Centered Code
- **Simplicity Over Abstraction**: Logic must be written directly and imperatively. Code should read top-to-bottom without being hidden inside complex inheritance trees, abstract repositories, service interfaces, or dependency injection containers.
- **Explainability**: Every route, middleware, and database query must be understandable by a Semester 3 student and defendable to a professor.
- **Fail Early with Guard Clauses**: Validate inputs at the beginning of handlers using simple JavaScript `if` conditions and return immediately with appropriate HTTP error codes before executing business or database operations.
- **Explicit Flow**: Always write out steps explicitly:
  1. Extract and sanitize parameters (`req.body`, `req.params`, `req.query`).
  2. Validate required fields and formats using `if` checks.
  3. Execute Prisma queries with `try/catch`.
  4. Return explicit HTTP status codes (200, 201, 204, 400, 401, 403, 404, 409, 500).

---

## 2. Strict Coding Conventions

### Language & Formatting Rules
- **Language**: Standard **JavaScript (ES2022+)**. Strictly **NO TypeScript**.
- **Module System**: **CommonJS** (`require` / `module.exports`) across all backend files.
- **Indentation**: Exactly **2 spaces** (no tabs).
- **Quotes**: **Double quotes (`"`)** for imports, object keys, and string literals.
- **Template Literals**: Use backticks (`` `${...}` ``) only when performing string interpolation or dynamic logging.
- **Semicolons**: **Always include semicolons** at the end of every statement.
- **No Compressed One-Liners**: Do not chain multiple operations or ternary operators into unreadable one-liners.

### Naming Conventions

| Element | Format | Examples |
| :--- | :--- | :--- |
| **Variables & Properties** | `camelCase` | `userId`, `hourlyRate`, `startTime`, `creatorId`, `isAvailable` |
| **Constants & Configs** | `SCREAMING_SNAKE_CASE` | `PORT`, `JWT_SECRET`, `SALT_ROUNDS`, `DEFAULT_PAGE_SIZE` |
| **Functions & Handlers** | `camelCase` (Verb + Noun) | `registerUser`, `loginUser`, `getAllStudios`, `createBooking`, `checkConflict` |
| **Middleware** | `camelCase` | `authenticateToken`, `requireProvider`, `errorHandler` |
| **Prisma Models** | `PascalCase` | `User`, `Studio`, `Booking` |
| **Enums & Enum Values** | `SCREAMING_SNAKE_CASE` | `USER`, `PROVIDER`, `CONFIRMED`, `CANCELLED`, `COMPLETED` |
| **Files & Folders** | `kebab-case` or `dot.notation` | `server.js`, `db.js`, `auth.js`, `studio.routes.js`, `booking.routes.js` |

---

## 3. Preferred Backend Architecture

### Recommended Structure for PodSphere
Instead of deep enterprise nesting (controllers-within-services-within-validators), the recommended architecture uses a **clean, modular Express Router + Prisma** structure that matches what is taught in Semester 3 Application Programming:

```text
backend/
├── .env                        # Environment variables (PORT, DATABASE_URL, JWT_SECRET)
├── .env.example                # Sample environment template
├── package.json                # Scripts and dependencies
├── prisma/
│   ├── schema.prisma           # Prisma database schema (PostgreSQL)
│   └── migrations/             # Migration history
├── MY_CODING_STYLE.md          # Permanent coding reference (this file)
└── src/
    ├── server.js               # Main Express entrypoint, middleware, route mounting & listener
    ├── db.js                   # PrismaClient singleton instance
    ├── middleware/
    │   ├── auth.js             # JWT verification (authenticateToken) & role checks (requireProvider)
    │   └── errorHandler.js     # Global fallback error handler
    ├── utils/
    │   └── helpers.js          # Helper functions (password hashing, JWT signing, data sanitization)
    └── routes/
        ├── auth.routes.js      # /api/auth routes (register, login, me, activate-provider)
        ├── studio.routes.js    # /api/studios routes (browse, details, create, edit, delete)
        └── booking.routes.js   # /api/bookings routes (create, creator list, provider list, status, cancel)
```

### Why this architecture fits Semester 3 best:
1. **Easy to Navigate**: Every resource has a single routes file containing its endpoints and validation.
2. **Clear Data Flow**: `Request -> Middleware -> Route Handler -> Prisma Query -> Response`.
3. **Zero Boilerplate Overhead**: Avoids 0-byte controller and service files that only pass arguments down a call chain.

---

## 4. Code Examples in My Style

### 1. Database Client (`src/db.js`)
```javascript
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = prisma;
```

---

### 2. Authentication & Authorization Middleware (`src/middleware/auth.js`)
```javascript
const jwt = require("jsonwebtoken");
const prisma = require("../db");

// Verify Bearer JWT in Authorization header
async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch fresh user record from database
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
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

// Ensure the authenticated user has PROVIDER role
function requireProvider(req, res, next) {
  if (!req.user || req.user.role !== "PROVIDER") {
    return res.status(403).json({ error: "Access forbidden. Provider role required." });
  }
  next();
}

module.exports = {
  authenticateToken,
  requireProvider
};
```

---

### 3. Authentication Routes (`src/routes/auth.routes.js`)
```javascript
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../db");
const { authenticateToken } = require("../middleware/auth");

const SALT_ROUNDS = 10;

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role = "USER" } = req.body;

    // Validation guard clauses
    if (!name || typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({ error: "Valid name is required." });
    }
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "Valid email address is required." });
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if email already registered
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      return res.status(409).json({ error: "Email is already registered." });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user in PostgreSQL
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash: passwordHash,
        role: role === "PROVIDER" ? "PROVIDER" : "USER"
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "Registration successful.",
      token: token,
      user: user
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Compare password with bcrypt hash
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };

    return res.status(200).json({
      message: "Login successful.",
      token: token,
      user: safeUser
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// GET /api/auth/me
router.get("/me", authenticateToken, (req, res) => {
  return res.status(200).json({ user: req.user });
});

module.exports = router;
```

---

### 4. Studio CRUD Routes (`src/routes/studio.routes.js`)
```javascript
const express = require("express");
const router = express.Router();
const prisma = require("../db");
const { authenticateToken, requireProvider } = require("../middleware/auth");

// GET /api/studios - Browse studios with search, city, and maxPrice filters
router.get("/", async (req, res) => {
  try {
    const { search, city, maxPrice } = req.query;

    const where = {};

    if (city && city.trim() !== "") {
      where.city = { equals: city.trim(), mode: "insensitive" };
    }

    if (maxPrice && !isNaN(Number(maxPrice))) {
      where.hourlyRate = { lte: Number(maxPrice) };
    }

    if (search && search.trim() !== "") {
      where.OR = [
        { name: { contains: search.trim(), mode: "insensitive" } },
        { description: { contains: search.trim(), mode: "insensitive" } }
      ];
    }

    const studios = await prisma.studio.findMany({
      where: where,
      include: {
        provider: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return res.status(200).json({ studios: studios });
  } catch (err) {
    console.error("Get studios error:", err);
    return res.status(500).json({ error: "Failed to fetch studios." });
  }
});

// GET /api/studios/:id - Get single studio details
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const studio = await prisma.studio.findUnique({
      where: { id: id },
      include: {
        provider: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!studio) {
      return res.status(404).json({ error: "Studio not found." });
    }

    return res.status(200).json({ studio: studio });
  } catch (err) {
    console.error("Get studio by ID error:", err);
    return res.status(500).json({ error: "Failed to fetch studio details." });
  }
});

// POST /api/studios - Create studio listing (Provider only)
router.post("/", authenticateToken, requireProvider, async (req, res) => {
  try {
    const { name, description, city, address, hourlyRate, gear = [] } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Studio name is required." });
    }
    if (!city || city.trim() === "") {
      return res.status(400).json({ error: "City is required." });
    }
    if (!address || address.trim() === "") {
      return res.status(400).json({ error: "Address is required." });
    }
    if (!hourlyRate || isNaN(Number(hourlyRate)) || Number(hourlyRate) <= 0) {
      return res.status(400).json({ error: "Valid positive hourly rate is required." });
    }

    const studio = await prisma.studio.create({
      data: {
        providerId: req.user.id,
        name: name.trim(),
        description: description ? description.trim() : null,
        city: city.trim(),
        address: address.trim(),
        hourlyRate: Number(hourlyRate),
        gear: Array.isArray(gear) ? gear : []
      }
    });

    return res.status(201).json({ message: "Studio created successfully.", studio: studio });
  } catch (err) {
    console.error("Create studio error:", err);
    return res.status(500).json({ error: "Failed to create studio." });
  }
});

// PUT /api/studios/:id - Update studio (Provider only, must own studio)
router.put("/:id", authenticateToken, requireProvider, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, city, address, hourlyRate, gear } = req.body;

    const existing = await prisma.studio.findUnique({
      where: { id: id }
    });

    if (!existing) {
      return res.status(404).json({ error: "Studio not found." });
    }

    if (existing.providerId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden: You do not own this studio." });
    }

    const updatedStudio = await prisma.studio.update({
      where: { id: id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(city !== undefined && { city: city.trim() }),
        ...(address !== undefined && { address: address.trim() }),
        ...(hourlyRate !== undefined && { hourlyRate: Number(hourlyRate) }),
        ...(gear !== undefined && Array.isArray(gear) && { gear: gear })
      }
    });

    return res.status(200).json({ message: "Studio updated successfully.", studio: updatedStudio });
  } catch (err) {
    console.error("Update studio error:", err);
    return res.status(500).json({ error: "Failed to update studio." });
  }
});

// DELETE /api/studios/:id - Delete studio (Provider only, must own studio)
router.delete("/:id", authenticateToken, requireProvider, async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.studio.findUnique({
      where: { id: id }
    });

    if (!existing) {
      return res.status(404).json({ error: "Studio not found." });
    }

    if (existing.providerId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden: You do not own this studio." });
    }

    await prisma.studio.delete({
      where: { id: id }
    });

    return res.status(200).json({ message: "Studio deleted successfully." });
  } catch (err) {
    console.error("Delete studio error:", err);
    return res.status(500).json({ error: "Failed to delete studio." });
  }
});

module.exports = router;
```

---

### 5. Booking Routes & Conflict Detection (`src/routes/booking.routes.js`)
```javascript
const express = require("express");
const router = express.Router();
const prisma = require("../db");
const { authenticateToken, requireProvider } = require("../middleware/auth");

// POST /api/bookings - Book a studio with conflict prevention
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { studioId, startTime, endTime } = req.body;

    if (!studioId || !startTime || !endTime) {
      return res.status(400).json({ error: "studioId, startTime, and endTime are required." });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: "Invalid date format for startTime or endTime." });
    }

    if (start >= end) {
      return res.status(400).json({ error: "startTime must be earlier than endTime." });
    }

    // Verify studio exists
    const studio = await prisma.studio.findUnique({
      where: { id: studioId }
    });

    if (!studio) {
      return res.status(404).json({ error: "Studio not found." });
    }

    // Server-side booking conflict check
    // Check for overlapping bookings: (ExistingStart < RequestedEnd) AND (ExistingEnd > RequestedStart)
    const conflict = await prisma.booking.findFirst({
      where: {
        studioId: studioId,
        status: { not: "CANCELLED" },
        startTime: { lt: end },
        endTime: { gt: start }
      }
    });

    if (conflict) {
      return res.status(409).json({
        error: "This time slot is already booked. Please choose a different time."
      });
    }

    // Calculate total amount (hours * hourlyRate)
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const totalAmount = Number(studio.hourlyRate) * durationHours;

    const booking = await prisma.booking.create({
      data: {
        creatorId: req.user.id,
        studioId: studioId,
        startTime: start,
        endTime: end,
        totalAmount: totalAmount,
        status: "CONFIRMED"
      },
      include: {
        studio: { select: { id: true, name: true, city: true, address: true } }
      }
    });

    return res.status(201).json({ message: "Booking confirmed successfully.", booking: booking });
  } catch (err) {
    console.error("Create booking error:", err);
    return res.status(500).json({ error: "Failed to create booking." });
  }
});

// GET /api/bookings/my-bookings - Get current user's bookings (Creator view)
router.get("/my-bookings", authenticateToken, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { creatorId: req.user.id },
      include: {
        studio: {
          select: { id: true, name: true, city: true, address: true, hourlyRate: true }
        }
      },
      orderBy: { startTime: "desc" }
    });

    return res.status(200).json({ bookings: bookings });
  } catch (err) {
    console.error("Get my-bookings error:", err);
    return res.status(500).json({ error: "Failed to fetch bookings." });
  }
});

// GET /api/bookings/provider-bookings - Get bookings for provider's studios (Provider view)
router.get("/provider-bookings", authenticateToken, requireProvider, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        studio: { providerId: req.user.id }
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        studio: { select: { id: true, name: true, city: true } }
      },
      orderBy: { startTime: "desc" }
    });

    return res.status(200).json({ bookings: bookings });
  } catch (err) {
    console.error("Get provider-bookings error:", err);
    return res.status(500).json({ error: "Failed to fetch incoming bookings." });
  }
});

// PATCH /api/bookings/:id/status - Update booking status (Provider only)
router.patch("/:id/status", authenticateToken, requireProvider, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["CONFIRMED", "CANCELLED", "COMPLETED"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid booking status." });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: id },
      include: { studio: true }
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found." });
    }

    if (booking.studio.providerId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden: You do not own this studio." });
    }

    const updated = await prisma.booking.update({
      where: { id: id },
      data: { status: status }
    });

    return res.status(200).json({ message: "Booking status updated.", booking: updated });
  } catch (err) {
    console.error("Update booking status error:", err);
    return res.status(500).json({ error: "Failed to update booking status." });
  }
});

// PATCH /api/bookings/:id/cancel - Cancel booking (Creator can cancel own booking)
router.patch("/:id/cancel", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id: id }
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found." });
    }

    if (booking.creatorId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden: You can only cancel your own bookings." });
    }

    const updated = await prisma.booking.update({
      where: { id: id },
      data: { status: "CANCELLED" }
    });

    return res.status(200).json({ message: "Booking cancelled successfully.", booking: updated });
  } catch (err) {
    console.error("Cancel booking error:", err);
    return res.status(500).json({ error: "Failed to cancel booking." });
  }
});

module.exports = router;
```

---

## 5. Required Dependencies & Packages

To run the backend code above, the following packages are needed in `backend/package.json`:

```json
{
  "dependencies": {
    "@prisma/client": "^7.10.0",
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "express": "^5.2.1",
    "jsonwebtoken": "^9.0.2",
    "prisma": "^7.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.14"
  }
}
```

### Purpose of each package:
- `express`: Web server framework and routing.
- `@prisma/client` & `prisma`: Database schema definitions, migrations, and PostgreSQL query execution.
- `bcrypt`: Password hashing (`bcrypt.hash`) and verification (`bcrypt.compare`).
- `jsonwebtoken`: Signing and verifying stateless authentication tokens.
- `cors`: Cross-Origin Resource Sharing middleware allowing the Vite React frontend (`http://localhost:5173`) to call the Express API (`http://localhost:5001`).
- `dotenv`: Loading environment secrets from `.env`.
- `nodemon`: Automatically restarting the development server upon code changes.

---

## 6. Libraries & Patterns to Avoid

1. **NO TypeScript**: The project is written in standard CommonJS JavaScript.
2. **NO Complex OOP or Class Hierarchies**: Do not use class-based controllers, abstract repositories, service classes, or dependency injection frameworks.
3. **NO Schema Validation Libraries**: Do not introduce Joi, Zod, Yup, or Celebrate. Write clear JavaScript `if (!field)` guard clauses.
4. **NO Silent Fallbacks or Mocking**: When connecting to the backend API, return real HTTP status codes. Do not pretend an operation succeeded when it failed.
5. **NO Unnecessary Middleware Layers**: Avoid excessive wrapper functions or rate limiters unless explicitly requested.
6. **NO Overcomplicated One-Liners**: Write logic on multiple lines so it is easy to read and explain.

---

## 7. Rules for Future AI-Generated Code

1. **Student Explainability First**: If a code reviewer asks "how does this route work?", the student must be able to explain the step-by-step logic in 30 seconds.
2. **Explicit HTTP Codes**: Always specify `res.status(...)` before `.json(...)`.
3. **Prisma Error Code Inspection**: Inspect `err.code === "P2002"` (unique constraint conflict) and `err.code === "P2025"` (record not found) in database operations.
4. **Data Sanitization**: Never return `passwordHash` in API responses.
5. **Consult This Document**: Always reference this file before generating or modifying any backend file.
