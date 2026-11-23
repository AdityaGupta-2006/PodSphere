# MY_CODING_STYLE.md

> **Reference Guide for AI Coding Agents & Collaborators**  
> This document analyzes and codifies the coding style, patterns, architecture, and conventions used across this codebase. Future AI assistants (including Google Antigravity) must reference this guide to maintain architectural consistency, idiomatic style, and familiar patterns when generating, refactoring, or extending code.

---

## 1. General Coding Philosophy

The code across this repository reflects a pragmatic, student-focused approach developed during an Application Programming course (Semester 3). It balances foundational software engineering fundamentals with modern backend Node.js and Express development.

### Core Principles
- **Simplicity Over Abstraction**: Code is written directly and imperatively. Logic is kept visible and readable rather than buried under layers of abstraction, factories, or complex object-oriented hierarchies.
- **Progressive Learning Mindset**: The workspace charts a clear progression:
  1. Low-level Node.js primitives (`http`, `fs`, `readline`, `events`).
  2. Basic Express routing and in-memory mock collections.
  3. Relational databases using raw SQL (`pg` Pool).
  4. Modern ORM workflows using Prisma (Prisma 6 and 7).
  5. Authentication paradigms (Cookies, Sessions, JWT, OAuth).
- **Explicit and Transparent Flow**: Route handlers and middleware favor explicit step-by-step logic—parsing parameters, running validation guard clauses, performing the database operation, and returning an explicit HTTP status code.
- **Fail Early with Guard Clauses**: Handlers validate incoming inputs first. Invalid requests trigger immediate returns with informative HTTP 400/401/404 responses before executing business logic.

---

## 2. Coding Style and Formatting

### Indentation and Spacing
- **Indentation**: 
  - **Consistent**: 2 spaces is standard across all recent lab solutions, Prisma routes, authentication modules, and the React frontend.
  - **Occasional**: 4 spaces appears in several earlier lecture files and specific standalone lab challenges (e.g., `Complete Movie API with Middleware Chaining.js`, `Lec/d3_routing/script.js`).
  - *Directive for AI*: Default to **2 spaces** for all newly generated files.
- **Line Spacing**: Clear blank lines separate logical sections:
  1. Module imports.
  2. Configuration / middleware initialization.
  3. Route definitions / helper functions.
  4. Server initialization (`app.listen(...)`) and module exports.

### Quotes and Strings
- **Double Quotes (`"`)**: Preferred for imports, object keys, and string literals in the vast majority of backend files:
  ```javascript
  const express = require("express");
  const prisma = require("../db");
  ```
- **Single Quotes (`'`)**: Used occasionally in specific sub-projects (e.g., `ap_project/backend`, `Lec/d6_router`, and React components):
  ```javascript
  const express = require('express');
  ```
- **Template Literals (`` `${...}` ``)**: Consistently used for string interpolation, dynamic route URLs, logging, and SQL statements:
  ```javascript
  console.log(`Server is running on http://localhost:${port}`);
  ```
  - *Directive for AI*: Standardize on **double quotes (`"`)** for backend JavaScript and reserve template literals for dynamic expressions.

### Semicolons
- **Usage**: Used consistently in most backend routes, database scripts, and middleware files. 
- **Omissions**: Omitted occasionally in rapid scripting files and in `ap_project/backend/routes/videos.js`.
  - *Directive for AI*: **Always include semicolons** at the end of statements.

---

## 3. Variable and Function Naming

### Naming Conventions

| Identifier Type | Convention | Examples from Code |
| :--- | :--- | :--- |
| **Variables & Object Properties** | `camelCase` | `userId`, `failedAttempts`, `courseId`, `newProduct`, `imageUrl`, `cleanEmail`, `filteredArticles` |
| **Constants & Configs** | `SCREAMING_SNAKE_CASE` | `PORT`, `SECRET`, `PREMIUM_KEY`, `SESSION_COOKIE`, `SESSION_TTL_MS`, `CHAT_PATH` |
| **Functions & Handlers** | `camelCase` (Verb + Noun) | `getAllCourses`, `createCourse`, `calculateTotalCost`, `verifyPremiumMember`, `normalizeEmail`, `publicUser`, `newSessionId` |
| **Prisma Models & Classes** | `PascalCase` | `User`, `Post`, `Profile`, `Students`, `EventEmitter`, `PrismaClient`, `PrismaPg`, `Pool` |
| **React Components** | `PascalCase` | `App`, `VideoPlayer`, `Header`, `CommentSection`, `Sidebar` |

### File and Folder Naming
- **Route files**: Named using resource dot notation: `users.routes.js`, `posts.routes.js`, `profile.routes.js` (or occasionally camelCase `productRoute.js`).
- **MVC files**: Prefixed or dotted: `controller.course.js`, `model.course.js`.
- **Modular files**: Clean, single-word lower case: `server.js`, `app.js`, `db.js`, `auth.js`, `session.js`, `utils.js`.
- **Lecture / Lab folders**: Prefixed with day or topic: `d6_router`, `d10_prisma`, `Lab-8`, `d8_assignment-portal`.

---

## 4. JavaScript Coding Patterns

### Module Systems: CommonJS vs ES Modules
- **CommonJS (`require` / `module.exports`) — Primary Pattern**:
  Used across almost all backend projects, lab answers, and Express servers:
  ```javascript
  const express = require("express");
  const router = express.Router();
  // ...
  module.exports = router;
  // Or named exports:
  module.exports = { app, prisma };
  ```
- **ES Modules (`import` / `export`) — Occasional Pattern**:
  Used specifically when `"type": "module"` is configured in `package.json` (e.g., `Lec/d8_Database_Integration`, `Lab/d4_server/server.js`, Prisma TypeScript configs like `prisma7.config.ts`, and frontend React code):
  ```javascript
  import express from "express";
  export const prisma = new PrismaClient({ adapter });
  ```
  - *Directive for AI*: Stick to **CommonJS** (`require` / `module.exports`) for all backend Node.js code unless the target package explicitly specifies `"type": "module"`.

### Destructuring
Destructuring is used heavily and consistently for:
- **Module imports**:
  ```javascript
  const { PrismaClient } = require("@prisma/client");
  const { Pool } = require("pg");
  const { randomBytes } = require("node:crypto");
  ```
- **Express request objects**:
  ```javascript
  const { title, deadline } = req.body;
  const { id } = req.params;
  const { name, limit = 5, page = 1 } = req.query;
  ```

### Spread Syntax and Immutability
- **Updating objects in place**:
  ```javascript
  courses[index] = {
    ...courses[index],
    ...req.body
  };
  ```
- **Conditional object and array spreading**:
  Used when building dynamic query objects for Prisma:
  ```javascript
  // Conditional object property
  data: {
    ...(imageUrl !== undefined && { imageUrl }),
    ...(caption !== undefined && { caption }),
    ...(location !== undefined && { location })
  }

  // Conditional array elements for OR filter
  where: {
    OR: [
      ...(caption ? [{ caption: { contains: caption, mode: "insensitive" } }] : []),
      ...(location ? [{ location: { contains: location, mode: "insensitive" } }] : [])
    ]
  }
  ```

### Type Conversions and Validations
- Explicit conversion of string route/query params:
  - `Number(req.params.id)` or `parseInt(req.params.id, 10)`
- Validation checks:
  ```javascript
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid post ID" });
  }
  ```

---

## 5. Functions, Loops and Conditions

### Function Declarations vs Arrow Functions
- **Named Function Declarations**: Used for standalone utility helpers, middleware, and MVC controller functions:
  ```javascript
  function calculateTotalCost(req, res, next) { ... }
  async function requireAuth(req, res, next) { ... }
  function getAllCourses(req, res) { ... }
  ```
- **Arrow Functions**: Used for inline Express route handlers, callback handlers, array methods, and short single-line utility helpers:
  ```javascript
  const normalizeEmail = (email) => email.trim().toLowerCase();
  const publicUser = (user) => ({ id: user.id, email: user.email });

  router.get("/", async (req, res) => { ... });
  ```

### Guard Clauses and Early Returns
Conditional logic avoids deep nesting. Validations check negative conditions and exit immediately:
```javascript
// Typical validation pattern from Lab-8 / Complete Movie API
if (!key || key !== PREMIUM_KEY) {
  return res.status(401).json({
    error: "Unauthorized: Invalid or missing premium key"
  });
}

if (!title || typeof title !== "string" || title.trim() === "") {
  return res.status(400).json({ error: "Invalid title" });
}

next();
```

### Array Methods vs Traditional Loops
Traditional `for` or `while` loops are **virtually never used** in this codebase. Functional array methods are the consistent standard:
- `.find()`: To retrieve a single element matching an ID.
- `.findIndex()` & `.splice()`: To locate and delete/update an item in an in-memory array.
- `.filter()`: For searching, filtering criteria, or removing items.
- `.map()`: To transform records or render JSX components.
- `.some()`: To check existence in a list.
- `.slice()`: For paginating array subsets (`filteredArticles.slice((pageNum - 1) * limitNum, pageNum * limitNum)`).

---

## 6. Async/Await, Promises and Error Handling

### Asynchronous Operations
- **`async/await`**: The universal standard for all database interactions, hashing, external requests, and authentication logic.
- **Event Listeners**: Used for stream and event processing (`.on("data", ...)`, `.on("end", ...)`).
- **Synchronous FS Calls**: Synchronous file methods (`fs.readFileSync`, `fs.writeFileSync`, `fs.appendFileSync`) are used in early labs and file-based mock databases for simplicity.

### Error Handling Pattern in Controllers / Routes
Route handlers wrap asynchronous operations in `try/catch` blocks:
```javascript
router.post("/", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Required fields missing" });
    }
    
    // Business / DB logic ...
    
    res.status(201).json(createdEntity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

### Specific Database Error Code Handling
Error codes from Prisma are checked explicitly in `catch` blocks before falling back to HTTP 500:
- **`P2025`** (Record not found on update or delete):
  ```javascript
  catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Post not found" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
  ```
- **`P2002`** (Unique constraint violation, e.g. email already exists):
  ```javascript
  catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Email already registered" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
  ```

### HTTP Status Code Usage
Status codes are strictly and intentionally applied:
- `200 OK`: Standard response for successful `GET`, `PATCH`, `PUT`.
- `201 Created`: Successful creation via `POST`.
- `204 No Content`: Successful deletion (`res.status(204).send()`).
- `400 Bad Request`: Missing body fields, invalid data types, or invalid query limits.
- `401 Unauthorized`: Missing or invalid credentials, tokens, or expired sessions.
- `404 Not Found`: Entity not found in database or unknown route.
- `409 Conflict`: Unique constraint clash (e.g. user already exists).
- `500 Internal Server Error`: Server or database unexpected failure (`res.status(500).json({ error: err.message })`).

---

## 7. Node.js and Express Patterns

### Standard Application Setup
The canonical Express server initialization pattern:
```javascript
require("dotenv").config();
const express = require("express");
const app = express();

// Standard middleware
app.use(express.json());

// Routes
const userRouter = require("./routes/users.routes");
app.use("/users", userRouter);

// Health check endpoint (frequently included)
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Port configuration & listener
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
```

### Environment Configuration
- Uses `dotenv`:
  - Either `require("dotenv").config();`
  - Or `require("dotenv/config");`
- Access variables via `process.env.VARIABLE_NAME`.
- Fallbacks with logical OR: `const PORT = process.env.PORT || 3000;` or nullish coalescing `process.env.PORT ?? 3000;`.

### Testability Pattern
When writing standalone challenge modules or testable servers, the app listener is guarded:
```javascript
if (require.main === module) {
  app.listen(3000, () => console.log("Server running on port 3000"));
}

module.exports = app;
```

---

## 8. API and Middleware Structure

### Route Definition Pattern
Express routes are modularized using `express.Router()`:
```javascript
const express = require("express");
const router = express.Router();
const prisma = require("../db");

// Routes attached directly to router
router.get("/", async (req, res) => { ... });
router.get("/:id", async (req, res) => { ... });
router.post("/", async (req, res) => { ... });
router.patch("/:id", async (req, res) => { ... });
router.delete("/:id", async (req, res) => { ... });

module.exports = router;
```

### Middleware Design
1. **Request Enrichment / Context Passing**:
   Middleware populates custom properties onto `req` before invoking `next()`:
   ```javascript
   // Session Auth Middleware
   async function requireAuth(req, res, next) {
     const sessionId = req.cookies[SESSION_COOKIE];
     if (!sessionId) return res.status(401).json({ error: "Not logged in" });

     const session = await getSessionWithUser(sessionId);
     if (!session) return res.status(401).json({ error: "Invalid or expired session" });

     req.user = session.user;
     req.sessionId = session.id;
     next();
   }

   // JWT Middleware
   function authenticateMiddleware(req, res, next) {
     const authHeader = req.headers.authorization;
     if (!authHeader || !authHeader.startsWith("Bearer ")) {
       return res.status(401).json({ message: "Unauthorized" });
     }
     const token = authHeader.substring(7);
     try {
       const decoded = jwt.verify(token, process.env.JWT_SECRET);
       req.user = decoded;
       next();
     } catch (error) {
       return res.status(401).json({ message: "Invalid or expired token" });
     }
   }
   ```
2. **Middleware Chaining**:
   Middleware is passed as separate arguments directly in the route declaration:
   ```javascript
   app.post(
     "/movies",
     verifyPremiumMember,
     validateMovie,
     (req, res) => { ... }
   );

   app.get("/me", requireAuth, (req, res) => {
     res.json({ user: req.user });
   });
   ```

---

## 9. Database Interaction Patterns

The repository contains two primary database strategies: **Prisma ORM** (latest, preferred) and **Raw PostgreSQL via `pg.Pool`**.

### Pattern A: Prisma ORM (Preferred / Current Standard)

#### Client Setup (`db.js`)
Prisma 7 with `@prisma/adapter-pg`:
```javascript
require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({ adapter });

module.exports = prisma;
```

#### Schema Conventions (`schema.prisma`)
```prisma
datasource db {
  provider = "postgresql"
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  email     String   @unique
  password  String
  fullName  String
  bio       String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  posts     Post[]
}

model Post {
  id        Int      @id @default(autoincrement())
  imageUrl  String
  caption   String?
  userId    Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

#### Query Conventions
- **Relations (`connect` & `include`)**:
  ```javascript
  const post = await prisma.post.create({
    data: {
      imageUrl,
      caption,
      user: {
        connect: { id: Number(userId) }
      }
    },
    include: { user: true }
  });
  ```
- **Selective Field Returns (`select`)**: Used to prevent returning sensitive fields (like password):
  ```javascript
  const user = await prisma.user.create({
    data: { username, email, password: hashedPassword },
    select: { id: true, username: true, email: true, createdAt: true }
  });
  ```
- **Text Search**:
  ```javascript
  where: {
    caption: {
      contains: value,
      mode: "insensitive"
    }
  }
  ```
- **Range & Comparison Filters**:
  ```javascript
  where: {
    id: {
      gte: Number(min),
      lte: Number(max)
    }
  }
  ```
- **Sorting & Pagination**:
  ```javascript
  const posts = await prisma.post.findMany({
    where: { ... },
    orderBy: { [field]: order },
    skip: (page - 1) * limit,
    take: limit
  });
  ```

---

### Pattern B: Raw PostgreSQL with `pg` (`Pool`)

Used for direct SQL queries and database integration assignments:

#### Pool Setup (`db.js`)
```javascript
require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

module.exports = pool;
```

#### Query Execution Pattern
- Always use parameterized queries (`$1, $2, ...`) to prevent SQL injection.
- Always use `RETURNING *` for `INSERT`, `UPDATE`, and `DELETE`.
- Check `result.rows.length === 0` to detect non-existent IDs.
```javascript
app.post("/assignments", async (req, res) => {
  const { title, deadline } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO assignments (title, deadline) VALUES ($1, $2) RETURNING *",
      [title, deadline]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});
```

---

### Pattern C: Password Hashing & Authentication
- **Hashing**: `bcrypt.hash(password, 10)` (salt rounds = 10).
- **Verification**: `await bcrypt.compare(password, user.password)`.
- **JWT**:
  ```javascript
  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: "15m", algorithm: "HS256" }
  );
  ```
- **Cookies**:
  ```javascript
  res.cookie(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  ```

---

## 10. File and Folder Organization

### Typical Project Architectures

#### 1. Express + Prisma Multi-Route Service (Recommended Architecture)
```
project/
├── .env
├── package.json
├── prisma/
│   └── schema.prisma
├── generated/              # If custom output path is configured
└── src/
    ├── index.js            # App entrypoint, middleware mounting, app.listen
    ├── db.js               # PrismaClient instance and adapter export
    ├── auth.js             # Authentication middleware
    ├── session.js          # Session storage methods (if session-based)
    ├── utils.js            # Helper functions and constants
    └── routes/
        ├── users.routes.js # Resource-specific router
        └── posts.routes.js # Resource-specific router
```

#### 2. MVC Architecture (Course Architecture)
```
project/
├── script.js               # Route mounting and server setup
├── controller/
│   └── controller.course.js # Handler functions (getAllCourses, createCourse, etc.)
└── model/
    └── model.course.js     # Data schema or entity collection
```

#### 3. Fullstack Client/Server Structure
```
ap_project/
├── backend/
│   ├── server.js
│   ├── routes/
│   ├── data/
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.js
    │   └── components/
    └── package.json
```

---

## 11. Concepts and Techniques I Commonly Use

The following technologies, libraries, and techniques are demonstrated throughout the project files:

- **Node.js Core Modules**:
  - `http`: Low-level server creation, header handling, request streaming.
  - `fs` & `path`: Reading/writing files, `path.join(__dirname, ...)`, streaming with `createReadStream`.
  - `events`: `EventEmitter` instances, `.on()`, `.emit()` custom event buses.
  - `readline`: Interactive CLI user input prompts.
  - `crypto`: Cryptographically secure ID generation via `randomBytes(32).toString("hex")`.
- **Backend Libraries**:
  - `express`: Routing, JSON middleware, query/param parsing, static file serving.
  - `@prisma/client` & `@prisma/adapter-pg`: ORM schemas, migrations, relations, filtering, pagination.
  - `pg`: Connection pooling (`Pool`), parameterized SQL queries.
  - `bcrypt`: Password hashing (`bcrypt.hash`, `bcrypt.compare`).
  - `jsonwebtoken`: Signing and verifying bearer JWTs.
  - `cookie-parser`: Reading and writing HTTP cookies (`res.cookie`, `res.clearCookie`, `req.cookies`).
  - `passport` & `passport-google-oauth20`: OAuth2 authentication flows.
  - `cors`: Cross-origin request management.
  - `dotenv`: Managing environment secrets across dev and production.
- **Frontend / React Basics**:
  - Functional React components with hooks: `useState`, `useEffect`.
  - HTTP requests via `axios` (`axios.get`, `axios.post`, `axios.put`, `axios.delete`).
  - Controlled form inputs and basic conditional rendering.

---

## 12. Things to Avoid When Generating Code

To ensure generated code matches my skills, project context, and preferences, **do NOT**:

1. **Avoid Overengineering & Unnecessary Abstractions**:
   - Do not generate abstract repositories, Unit of Work patterns, or dependency injection containers.
   - Do not use complex class-based OOP architectures when simple exported functions and Express routers suffice.
2. **Avoid Unfamiliar Frameworks or Libraries**:
   - Do not introduce TypeScript unless the workspace or user explicitly requests it (the project is written in idiomatic JavaScript).
   - Do not introduce alternate ORMs/ODMs like Mongoose, Sequelize, or TypeORM. Stick to **Prisma** or raw **`pg`**.
   - Do not add schema validation libraries (Zod, Joi, Yup, Celebrate) unless instructed. Write direct, readable JavaScript `if` condition checks.
3. **Avoid Unsafe SQL or Database Anti-Patterns**:
   - Never concatenate raw strings into SQL queries; always use parameterized queries (`$1, $2`).
   - Never return raw user records containing `password` or password hashes; use Prisma `select` or a sanitize helper like `publicUser()`.
4. **Avoid Architectural Inconsistencies**:
   - Do not mix CommonJS (`require`) and ES Module (`import`) syntax in the same backend project.
   - Do not leave endpoints without explicit status codes (always specify `res.status(200)`, `res.status(201)`, etc.).
   - Do not swallow errors silently in `catch` blocks without returning an HTTP response.
5. **Avoid Unnecessary Comments**:
   - Do not clutter generated code with repetitive inline tutorial comments explaining standard JavaScript syntax. Keep comments strictly to architectural notes or non-obvious logic.

---

## 13. Instructions for Future AI Coding Agents

When working on this repository or generating new features, future AI assistants (including Google Antigravity) must strictly follow these instructions:

1. **Follow the Demonstrated Coding Style**:
   - Use CommonJS (`require` / `module.exports`) for backend code by default.
   - Use 2-space indentation, double quotes for strings, and semicolons.
   - Name variables and functions in `camelCase`, constants in `SCREAMING_SNAKE_CASE`, and models/components in `PascalCase`.
2. **Prioritize Familiar Patterns Over Advanced Alternatives**:
   - Prefer explicit imperative logic, early-return guard clauses, and functional array methods (`.filter`, `.find`, `.map`).
   - Use `async/await` with standard `try/catch` blocks for all asynchronous operations.
3. **Maintain File and Route Organization**:
   - Place database client instances in a dedicated `db.js` file.
   - Break routes into `routes/<resource>.routes.js` using `express.Router()`.
   - Put shared constants and helper functions in a `utils.js` file.
4. **Uphold Correctness, Security, and Quality**:
   - Always hash passwords with `bcrypt` (10 rounds) before persisting.
   - Always sanitize output data to omit sensitive credentials.
   - Check Prisma error codes (e.g. `P2025` for not found, `P2002` for unique conflict).
   - Return appropriate HTTP status codes: 200 (OK), 201 (Created), 204 (No Content), 400 (Bad Request), 401 (Unauthorized), 404 (Not Found), 409 (Conflict), 500 (Internal Server Error).
5. **Explain New Concepts Before Introducing Them**:
   - If a problem requires a library, pattern, or tool not already found in this repository, briefly explain why it is needed before implementing it.
6. **Never Blindly Copy Existing Code**:
   - Adapt patterns to the specific requirements of the new problem rather than duplicating boilerplate that does not apply.
