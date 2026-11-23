# 🎙️ PodSphere Backend API

> **Semester 3 Application Programming Project**  
> Complete REST API backend for the PodSphere podcast studio discovery and booking platform, built using Node.js, Express, PostgreSQL, and Prisma ORM.

---

## 📋 Table of Contents
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Prerequisites](#-prerequisites)
- [Environment Configuration](#-environment-configuration)
- [Installation & Database Setup](#-installation--database-setup)
- [Running the Server](#-running-the-server)
- [Running Automated Tests](#-running-automated-tests)
- [Complete API Reference](#-complete-api-reference)
  - [System Health](#1-system-health)
  - [Authentication & Users](#2-authentication--users)
  - [Studio Management](#3-studio-management)
  - [Booking System](#4-booking-system)
- [Key Design Decisions](#-key-design-decisions)
  - [1. Role Mapping & Permissions](#1-role-mapping--permissions)
  - [2. Timezone Handling (Asia/Kolkata)](#2-timezone-handling-asiakolkata)
  - [3. Concurrency & Conflict Prevention](#3-concurrency--conflict-prevention)
  - [4. Dual-Mode Architecture](#4-dual-mode-architecture)
- [Coding Style & Conventions](#-coding-style--conventions)

---

## 🏗️ Architecture & Tech Stack

```text
CLIENT (React 19 / Vite / Tailwind)
   │
   ▼ HTTP (Authorization: Bearer <JWT>)
EXPRESS ROUTER (src/routes/)
   │
   ├─▶ MIDDLEWARE (authenticate.js, authorize.js, errorHandler.js)
   │
   ├─▶ CONTROLLERS (src/controllers/ - auth, studio, booking)
   │
   ├─▶ SERVICES (src/services/ - business logic & data transformations)
   │
   ├─▶ PRISMA CLIENT + DRIVER ADAPTER (@prisma/adapter-pg)
   │
   ▼ SQL Queries & Transactions (FOR UPDATE row locking)
POSTGRESQL DATABASE ("User", "Studio", "Booking")
```

- **Runtime**: Node.js (CommonJS, ES2022+)
- **Framework**: Express 5
- **Database**: PostgreSQL
- **ORM**: Prisma 7 (with `@prisma/adapter-pg` driver adapter)
- **Authentication**: Stateless JSON Web Tokens (`jsonwebtoken`)
- **Password Security**: `bcrypt` (10 salt rounds)
- **Timezone Standard**: Indian Standard Time (`Asia/Kolkata` - UTC+05:30)

---

## ⚙️ Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **PostgreSQL**: v14.0 or higher running locally on port `5432`
- **npm**: v9.0.0 or higher

---

## 🔐 Environment Configuration

Create a `.env` file inside the `backend/` directory based on `.env.example`:

```env
PORT=5001
CLIENT_URL="http://localhost:5173"
DATABASE_URL="postgresql://username:password@localhost:5432/podsphere"
JWT_SECRET="podsphere_jwt_super_secret_key_2026"
```

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | Port for the Express server (set to 5001 to avoid macOS AirPlay conflict on 5000) | `5001` |
| `CLIENT_URL` | Allowed frontend origin for CORS | `http://localhost:5173` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/podsphere` |
| `JWT_SECRET` | Secret key used to sign and verify authentication tokens | String (>= 32 chars recommended) |

---

## 🚀 Installation & Database Setup

1. **Install Dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

3. **Verify Database Schema**:
   The database tables (`User`, `Studio`, `Booking`) are managed via Prisma:
   ```bash
   npx prisma migrate status
   ```

---

## 💻 Running the Server

- **Development Mode** (with automatic restart via `nodemon`):
  ```bash
  npm run dev
  ```

- **Production / Direct Mode**:
  ```bash
  npm start
  ```

When running, the server listens at `http://localhost:5001` (API endpoints prefixed with `/api`).

---

## 🧪 Running Automated Tests

The backend includes a comprehensive native test suite with **69 assertions** covering happy paths, edge cases, error codes, and concurrency race conditions:

```bash
npm test
```

All tests execute in-process using an ephemeral port and automatically clean up test data from PostgreSQL upon completion.

---

## 📖 Complete API Reference

All requests and responses use `Content-Type: application/json`. Protected endpoints require the header `Authorization: Bearer <token>`.

### 1. System Health

#### `GET /api/health`
- **Access**: Public
- **Description**: Verifies API availability and live database connectivity.
- **Success Response** (`200 OK`):
  ```json
  {
    "status": "ok",
    "database": "connected",
    "message": "PodSphere API and database are operational",
    "timestamp": "2026-11-23T10:00:00.000Z"
  }
  ```

---

### 2. Authentication & Users

#### `POST /api/auth/register`
- **Access**: Public
- **Body**:
  ```json
  {
    "name": "Alex Miller",
    "email": "alex@example.com",
    "password": "securePassword123",
    "role": "USER"
  }
  ```
  *(Note: `role` can be `"USER"` or `"PROVIDER"`, defaults to `"USER"`).*
- **Success Response** (`201 Created`):
  ```json
  {
    "token": "eyJhbGciOi...",
    "user": {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "name": "Alex Miller",
      "email": "alex@example.com",
      "role": "USER",
      "roles": ["creator"],
      "createdAt": "2026-11-23T10:00:00.000Z"
    }
  }
  ```
- **Errors**: `400 Bad Request` (missing fields or password < 6 chars), `409 Conflict` (email already exists).

#### `POST /api/auth/login`
- **Access**: Public
- **Body**:
  ```json
  {
    "email": "alex@example.com",
    "password": "securePassword123"
  }
  ```
- **Success Response** (`200 OK`):
  ```json
  {
    "token": "eyJhbGciOi...",
    "user": {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "name": "Alex Miller",
      "email": "alex@example.com",
      "role": "USER",
      "roles": ["creator"]
    }
  }
  ```
- **Errors**: `400 Bad Request` (missing fields), `401 Unauthorized` (invalid email or password).

#### `GET /api/auth/me`
- **Access**: Authenticated (`Bearer <token>`)
- **Description**: Returns the verified user profile corresponding to the token.
- **Success Response** (`200 OK`):
  ```json
  {
    "user": {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "name": "Alex Miller",
      "email": "alex@example.com",
      "role": "USER",
      "roles": ["creator"]
    }
  }
  ```
- **Errors**: `401 Unauthorized` (missing or invalid token).

#### `POST /api/auth/activate-provider`
- **Access**: Authenticated (`Bearer <token>`)
- **Description**: Upgrades an existing creator account to provider status. Re-issues a fresh JWT with updated claims.
- **Success Response** (`200 OK`):
  ```json
  {
    "message": "Provider privileges activated.",
    "token": "eyJhbGciOi...",
    "user": {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "name": "Alex Miller",
      "email": "alex@example.com",
      "role": "PROVIDER",
      "roles": ["creator", "provider"]
    }
  }
  ```

---

### 3. Studio Management

#### `GET /api/studios`
- **Access**: Public
- **Query Parameters**:
  - `city` (optional): Filter by city (e.g. `?city=Delhi`)
  - `maxPrice` (optional): Filter by maximum hourly rate (e.g. `?maxPrice=2000`)
  - `search` (optional): Substring match across name, city, address, description
  - `providerId` (optional): Filter studios owned by a specific provider
- **Success Response** (`200 OK`): Array of studio objects.

#### `GET /api/studios/:id`
- **Access**: Public
- **Success Response** (`200 OK`):
  ```json
  {
    "studio": {
      "id": "e5b88a9c-0744-42ea-9e7a-9f55a7201b1a",
      "providerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "name": "Echo Room Studio",
      "city": "Delhi",
      "address": "Suite 402, Okhla Phase III",
      "hourlyRate": 1500,
      "description": "Treated acoustic broadcast space.",
      "gear": ["4x Shure SM7B", "Rodecaster Pro II"],
      "imageUrl": "https://...",
      "provider": {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "name": "Studio Host",
        "email": "host@example.com"
      }
    }
  }
  ```
- **Errors**: `404 Not Found` (studio does not exist or invalid UUID format).

#### `POST /api/studios`
- **Access**: Authenticated + Provider (`role === "PROVIDER"`)
- **Body**:
  ```json
  {
    "name": "Metropolis Broadcast Lab",
    "city": "Bengaluru",
    "address": "77 Koramangala 4th Block",
    "hourlyRate": 1800,
    "description": "Modular isolation suites with optical fiber.",
    "gear": ["4x Neumann TLM-103", "Apollo Twin X"],
    "imageUrl": "https://..."
  }
  ```
- **Success Response** (`201 Created`): Returns `{ message, studio }`.
- **Errors**: `400 Bad Request` (missing fields or rate <= 0), `403 Forbidden` (non-provider).

#### `PUT /api/studios/:id`
- **Access**: Authenticated + Studio Owner (`studio.providerId === req.user.id`)
- **Body**: Partial or full update payload (`name`, `city`, `address`, `hourlyRate`, `description`, `gear`, `imageUrl`).
- **Success Response** (`200 OK`): Returns `{ message, studio }`.
- **Errors**: `403 Forbidden` (caller does not own the studio), `404 Not Found`.

#### `DELETE /api/studios/:id`
- **Access**: Authenticated + Studio Owner
- **Description**: Deletes the studio listing. Rejects deletion if active or pending bookings exist on this studio.
- **Success Response** (`200 OK`):
  ```json
  { "success": true, "message": "Studio deleted successfully." }
  ```
- **Errors**: `400 Bad Request` (active bookings exist), `403 Forbidden` (non-owner), `404 Not Found`.

---

### 4. Booking System

#### `POST /api/bookings`
- **Access**: Authenticated Creator (`creatorId` derived strictly from JWT)
- **Body**:
  ```json
  {
    "studioId": "e5b88a9c-0744-42ea-9e7a-9f55a7201b1a",
    "rawDate": "2027-05-10",
    "time": "10:00 AM - 12:00 PM"
  }
  ```
- **Success Response** (`201 Created`):
  ```json
  {
    "message": "Booking request submitted successfully and is pending provider confirmation.",
    "booking": {
      "id": "b73a88c2-2802-4467-85be-51cead60411a",
      "studioId": "e5b88a9c-0744-42ea-9e7a-9f55a7201b1a",
      "creatorId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "studio": "Echo Room Studio",
      "date": "May 10, 2027",
      "rawDate": "2027-05-10",
      "day": "Monday",
      "time": "10:00 AM - 12:00 PM",
      "duration": "2.0 Hours Allocated",
      "rate": "₹1,500/hr rack rate",
      "amount": "₹3,000",
      "totalPrice": 3000,
      "status": "PENDING"
    }
  }
  ```
- **Errors**: `400 Bad Request` (past date or malformed slot), `404 Not Found`, `409 Conflict` (slot already booked or overlapping).

#### `GET /api/bookings`
- **Access**: Authenticated
- **Description**: Role-aware query endpoint used by the frontend. If `?role=provider`, returns bookings for studios owned by the authenticated provider. Otherwise, returns reservations placed by the authenticated creator.

#### `GET /api/bookings/creator`
- **Access**: Authenticated
- **Description**: Returns all reservations placed by the authenticated creator.

#### `GET /api/bookings/provider`
- **Access**: Authenticated Provider
- **Description**: Returns all incoming reservation requests across studios owned by the provider.
- **Errors**: `403 Forbidden` (non-provider).

#### `GET /api/bookings/:id`
- **Access**: Authenticated (must be the booking creator or the studio host)
- **Success Response** (`200 OK`): Returns `{ booking }`.
- **Errors**: `403 Forbidden` (unauthorized user), `404 Not Found`.

#### `PATCH /api/bookings/:id/status`
- **Access**: Authenticated Studio Host
- **Body**: `{ "status": "CONFIRMED" }` (or `"REJECTED"`, `"COMPLETED"`)
- **Transitions**:
  - `PENDING` -> `CONFIRMED` or `REJECTED`
  - `CONFIRMED` -> `COMPLETED`
- **Errors**: `400 Bad Request` (invalid transition or modifying terminal booking), `403 Forbidden` (caller does not own the studio).

#### `PATCH /api/bookings/:id/cancel`
- **Access**: Authenticated Booking Creator
- **Description**: Cancels a pending or confirmed reservation.
- **Success Response** (`200 OK`): Returns `{ success: true, booking }` with `status: "CANCELLED"`.
- **Errors**: `400 Bad Request` (booking already cancelled or completed), `403 Forbidden` (non-owner).

---

## 🎯 Key Design Decisions

### 1. Role Mapping & Permissions
- In PostgreSQL, the `User.role` enum is strictly `USER` (creator) or `PROVIDER` (host).
- When a user activates provider access, they become a `PROVIDER` in the database, while the API returns:
  ```json
  "role": "PROVIDER",
  "roles": ["creator", "provider"]
  ```
  This ensures providers can manage listings while retaining full capability to browse and book studios as a creator.

### 2. Timezone Handling (Asia/Kolkata)
- All date calculations and slot windows operate under Indian Standard Time (`UTC+05:30`).
- User input slots like `"10:00 AM - 12:00 PM"` on `"2027-05-10"` are converted into exact UTC start and end timestamps for database storage (`2027-05-10T04:30:00.000Z` to `2027-05-10T06:30:00.000Z`).
- On retrieval, `Intl.DateTimeFormat` with `timeZone: "Asia/Kolkata"` guarantees consistent local formatting regardless of where the server or client is hosted.

### 3. Concurrency & Conflict Prevention
- To prevent simultaneous double-booking of a studio, the reservation creation logic is executed inside an interactive Prisma transaction with PostgreSQL row locking:
  ```sql
  SELECT id FROM "Studio" WHERE id = :studioId::uuid FOR UPDATE;
  ```
- This serializes concurrent booking requests for that specific studio, eliminating race conditions while allowing concurrent bookings across different studios.

### 4. Dual-Mode Architecture
- **Demo Mode (`VITE_USE_API="false"`)**: Operates entirely in browser `localStorage` using pre-seeded studios and bookings.
- **API Mode (`VITE_USE_API="true"`)**: Connects to the Express backend with JWT session persistence.
- Zero changes were made to UI components; all switching happens cleanly through the service layer.

---

## 📝 Coding Style & Conventions
This codebase strictly adheres to the Semester 3 Application Programming guidelines documented in [backend/MY_CODING_STYLE.md](file:///Users/aniketkumar/Desktop/Projects/PodSphere/backend/MY_CODING_STYLE.md):
- Standard JavaScript (ES2022+), strictly NO TypeScript
- CommonJS (`require` / `module.exports`)
- 2-space indentation, double quotes (`"`), and semicolons
- Simple imperative logic over heavy abstractions or complex design patterns
- Explicit HTTP status codes (`200`, `201`, `400`, `401`, `403`, `404`, `409`, `500`)
- Guard clauses and early returns for input validation
