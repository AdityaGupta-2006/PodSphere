# PodSphere Repository Code Audit & Architectural Evaluation

**Author**: Senior Full-Stack Engineer, Software Architect & QA Specialist  
**Evaluation Date**: November 23, 2026  
**Target Milestone**: Capstone Project Evaluation Readiness  
**Target Project**: PodSphere (Podcast Studio Discovery & Booking Platform)  

---

## 1. Project Architecture & System Overview

PodSphere is a two-sided podcast recording studio discovery and booking platform built with:
- **Frontend**: React 19, Vite 8, Tailwind CSS, React Router 7.
- **Backend**: Node.js, Express 5, Prisma ORM 7 with `@prisma/adapter-pg`.
- **Database**: PostgreSQL with row-level transactional concurrency (`FOR UPDATE`).
- **Authentication**: Stateless JSON Web Tokens (`jsonwebtoken`) and `bcrypt` password hashing.
- **Timezone**: Indian Standard Time (`Asia/Kolkata`, UTC+05:30).

### Key Architectural Workflows

```
CREATOR WORKFLOW:
Register/Login ──▶ Browse Studios ──▶ Select Studio ──▶ Choose Date & Slot ──▶ Submit Booking (PENDING)
                                                                                       │
PROVIDER WORKFLOW:                                                                     ▼
Activate Provider ──▶ Create/Manage Studios ──▶ View Incoming Bookings ──▶ Confirm / Reject Booking
                                                                                       │
COMPLETION WORKFLOW:                                                                   ▼
Creator can Cancel (if PENDING/CONFIRMED) ◀── Provider Marks Session COMPLETED (if CONFIRMED)
```

---

## 2. Baseline Test & Build Verification

Prior to performing modifications, the following baseline checks were executed:

1. **Frontend Lint (`npm run lint`)**:
   - Status: PASSED (0 lint errors).
2. **Frontend Production Build (`npm run build`)**:
   - Status: PASSED (45 modules transformed, clean bundle output in `dist/`).
3. **Database Connectivity**:
   - Local PostgreSQL cluster detected running on port `5432` under user `adityakumargupta`.
   - Created missing `podsphere` database and ran initial Prisma migration `20261002163138_init`.
4. **Backend Automated Test Suite (`tests/system.test.js`)**:
   - Status: 69 Passed, 0 Failed against PostgreSQL test instance.
   - Note: While existing tests passed, critical business logic edge cases (same-day past time bookings, invalid time formats, calendar rollover, provider UI rejection, image upload limits, and race conditions) lacked test coverage or were masked.

---

## 3. Comprehensive Issue Registry & Severity Classification

Findings are classified into four severity tiers:
- **P0 – Critical**: Breaks core functionality, causes data corruption or loss, creates security vulnerabilities.
- **P1 – High**: Incomplete workflows, concurrency race conditions, payload failures, or integration breakdowns.
- **P2 – Medium**: Flawed error boundaries, silent empty states, sensitive data exposure, or inconsistent UX.
- **P3 – Low**: Documentation discrepancies, wording mismatches, and minor maintenance items.

---

### P0 – Critical Issues

#### BUG-P0-01: Frontend API Mode Disabled & Incorrect Port Configuration
- **Severity**: P0 – Critical
- **Affected Files**: `frontend/.env`, `frontend/.env.example`, `frontend/src/services/api.js`
- **Description**: The default environment configuration shipped with `VITE_USE_API=false` and `VITE_API_URL=http://localhost:5000/api`. The Express backend runs on port `5001` (to prevent conflicts with macOS AirPlay Receiver). Because `VITE_USE_API` was set to `false`, the frontend ran entirely in local mock/demo mode using `localStorage`, never communicating with the PostgreSQL database.
- **Root Cause**: Desynchronized `.env` files between frontend and backend.
- **Minimal Fix**: Update `frontend/.env` and `frontend/.env.example` to default to `VITE_API_URL=http://localhost:5001/api` and `VITE_USE_API=true`.

#### BUG-P0-02: Provider Bookings Endpoint Misrouting
- **Severity**: P0 – Critical
- **Affected Files**: `frontend/src/services/bookingApi.js`, `frontend/src/pages/provider/ProviderBookings.jsx`, `frontend/src/pages/provider/ProviderDashboard.jsx`
- **Description**: In `ProviderBookings.jsx` and `ProviderDashboard.jsx`, the components call `bookingApi.getBookings()` without passing `role: "provider"` or requesting the `/bookings/provider` endpoint. On the backend, `GET /api/bookings` defaults to `getBookingsForCreator(req.user.id)` when no role filter is provided. Consequently, provider consoles loaded either zero records or bookings made by the provider as a creator, failing to display reservations for studios they own.
- **Root Cause**: Incomplete query parameters in `bookingApi.getBookings()` and lack of a dedicated `getProviderBookings()` API helper in frontend services.
- **Minimal Fix**: Add `getProviderBookings()` and `getCreatorBookings()` to `frontend/src/services/bookingApi.js` targeting `/bookings/provider` and `/bookings/creator` respectively; update `ProviderBookings.jsx` and `ProviderDashboard.jsx` to invoke `bookingApi.getProviderBookings()`.

#### BUG-P0-03: Silent Provider Privilege Escalation Failure
- **Severity**: P0 – Critical
- **Affected Files**: `frontend/src/context/AuthContext.jsx` (function `activateProviderAccess`)
- **Description**: In `AuthContext.jsx`, the `activateProviderAccess` function wrapped `authApi.activateProvider()` in a `try...catch` block that suppressed errors (`catch (err) { void err; }`). It then unconditionally mutated local state and `localStorage` to assign `role: "provider"`, allowing the user into the provider workspace even when the backend API request failed, timed out, or rejected the escalation.
- **Root Cause**: Blind fallback to local state mutation without validating server confirmation.
- **Minimal Fix**: Require server confirmation in `activateProviderAccess()`. If `authApi.activateProvider()` fails, propagate the exception, do not mutate user role in `localStorage` or React state, and notify the user with an actionable error.

#### BUG-P0-04: Studio Deletion Destroys Historical Completed/Cancelled Bookings
- **Severity**: P0 – Critical
- **Affected Files**: `backend/src/services/studio.service.js` (function `deleteStudio`), `backend/src/controllers/studio/index.js`
- **Description**: When a studio is deleted, `studio.service.js` executes `await tx.booking.deleteMany({ where: { studioId: id } })`. While `hasActiveBookings` checks for `PENDING` and `CONFIRMED` statuses, studios with `COMPLETED`, `CANCELLED`, or `REJECTED` bookings would have all their historical booking records permanently deleted, violating audit trail and financial reporting integrity.
- **Root Cause**: Destructive cascading booking purge in `deleteStudio`.
- **Minimal Fix**: In `hasActiveBookings` (or an updated `hasBookingHistory`), check if *any* bookings exist for the studio (`count > 0`). If bookings exist, reject the deletion with HTTP 400 ("Cannot delete a studio with existing booking history. Studio must be retained for record-keeping."). Remove `deleteMany` on bookings to ensure historical integrity.

#### BUG-P0-05: Same-Day Past Time Slot Booking Permitted
- **Severity**: P0 – Critical
- **Affected Files**: `backend/src/controllers/booking/index.js` (function `createBooking`), `frontend/src/pages/creator/BrowseStudios.jsx`
- **Description**: The date check in `createBooking` only verified `new Date(`${rawDate.trim()}T23:59:59+05:30`) < now`. For any booking scheduled for "today", the end-of-day timestamp is in the future. Neither the controller nor the frontend verified that `parsedSlot.startTime >= now`. Consequently, creators could book slots in the past on the current day (e.g., booking 10:00 AM at 4:00 PM).
- **Root Cause**: Missing start-time comparison against `Date.now()` for current-day bookings.
- **Minimal Fix**: In `backend/src/controllers/booking/index.js`, add `if (parsedSlot.startTime < new Date()) { return res.status(400).json({ error: "Cannot book a time slot in the past." }); }`. Add matching client-side validation in `BrowseStudios.jsx`.

#### BUG-P0-06: Time Parser Accepts Invalid Hours, Minutes, and Format Strings
- **Severity**: P0 – Critical
- **Affected Files**: `backend/src/utils/time.js` (function `parseSingleTimeString`)
- **Description**: The regex in `parseSingleTimeString` allowed 12-hour hours > 12 (e.g., `13:30 PM`), minutes > 59 (e.g., `12:99 PM`), and 24-hour hours > 23 (e.g., `25:00` or `99:00`).
- **Root Cause**: Lack of boundary validation on parsed integers `hours` and `minutes`.
- **Minimal Fix**: In `parseSingleTimeString`, enforce:
  - 12h format: `hours >= 1 && hours <= 12`, `minutes >= 0 && minutes <= 59`.
  - 24h format: `hours >= 0 && hours <= 23`, `minutes >= 0 && minutes <= 59`.
  - Return `null` for any out-of-range value.

#### BUG-P0-07: Invalid Calendar Dates Silently Normalized
- **Severity**: P0 – Critical
- **Affected Files**: `backend/src/utils/time.js`, `backend/src/controllers/booking/index.js`
- **Description**: Nonexistent calendar dates like `2026-02-31` or `2026-04-31` are normalized by JavaScript's `Date` constructor to March 3 or May 1 instead of being rejected as malformed dates.
- **Root Cause**: Relying on loose `new Date(...)` constructor behavior without validating ISO calendar parts (year, month, day).
- **Minimal Fix**: Add a strict `isValidCalendarDate(rawDate)` helper that verifies regex `^\d{4}-\d{2}-\d{2}$` and ensures the reconstructed year, month, and day match the input components.

---

### P1 – High Severity Issues

#### BUG-P1-01: Provider Booking Rejection Missing from User Interface
- **Severity**: P1 – High
- **Affected Files**: `frontend/src/pages/provider/ProviderBookings.jsx`
- **Description**: The backend supports the `REJECTED` lifecycle state via `PATCH /api/bookings/:id/status`, but `ProviderBookings.jsx` only implemented "Confirm Booking" and "Mark as Completed" actions. There was no button or handler to reject a `PENDING` booking.
- **Root Cause**: Incomplete UI implementation in the provider booking management console.
- **Minimal Fix**: Add `handleRejectRequest(id)` calling `bookingApi.updateBookingStatus(id, "REJECTED")` and render a "Reject Booking" action button for `PENDING` bookings in `ProviderBookings.jsx`.

#### BUG-P1-02: Booking Status Update Concurrency Race Conditions
- **Severity**: P1 – High
- **Affected Files**: `backend/src/services/booking.service.js`, `backend/src/controllers/booking/index.js`
- **Description**: `updateBookingStatus` and `cancelBooking` in `booking.service.js` performed unconditional updates (`prisma.booking.update({ where: { id } })`). If a provider attempts to confirm or reject a booking while the creator simultaneously cancels it, concurrent requests could overwrite each other with invalid terminal transitions.
- **Root Cause**: Missing optimistic concurrency check / atomic conditional update on current booking status.
- **Minimal Fix**: Perform status updates inside a transaction or with conditional verification of the current status (e.g., verifying status is still `PENDING` before setting `CONFIRMED`/`REJECTED`, and checking status is still `PENDING`/`CONFIRMED` before setting `CANCELLED`). Return HTTP 409 Conflict if a concurrent update modified the booking.

#### BUG-P1-03: Demo Mode Booking Conflict Detection Failure & Status Inconsistency
- **Severity**: P1 – High
- **Affected Files**: `frontend/src/services/bookingApi.js` (function `createBooking`)
- **Description**: When running in demo mode, `createBooking` only verified `b.time === bookingData.time` (exact string match). Overlapping intervals (e.g., `10:00 - 12:00` vs `11:00 - 13:00`) were not detected. Furthermore, demo bookings were created with status `CONFIRMED` instead of `PENDING`, diverging from the actual backend workflow.
- **Root Cause**: Flawed time equality check instead of interval overlap logic in demo mode; hardcoded `CONFIRMED` status.
- **Minimal Fix**: Update demo mode conflict check to parse intervals and apply standard interval overlap condition (`slotA.start < slotB.end && slotA.end > slotB.start`); create demo bookings with status `PENDING`.

#### BUG-P1-04: Express 100kb Payload Limit on Base64 Studio Image Uploads
- **Severity**: P1 – High
- **Affected Files**: `backend/src/app.js`
- **Description**: `CreateEditStudio.jsx` reads studio photo uploads as Base64 Data URLs via `FileReader.readAsDataURL` and submits them in the JSON body. Express `express.json()` defaults to a 100kb payload limit. Uploading typical JPEG/PNG photos (500KB - 3MB) resulted in `PayloadTooLargeError: request entity too large` (HTTP 413).
- **Root Cause**: Default unconfigured `express.json()` limit.
- **Minimal Fix**: Update `backend/src/app.js` to `app.use(express.json({ limit: "10mb" }))` and `app.use(express.urlencoded({ extended: true, limit: "10mb" }))`.

#### BUG-P1-05: Insecure Hardcoded JWT Secret Fallback in Production
- **Severity**: P1 – High
- **Affected Files**: `backend/src/config/env.js`
- **Description**: `JWT_SECRET` defaulted silently to `"podsphere_jwt_super_secret_key_2026"` even if `NODE_ENV === "production"`, creating potential deployment security vulnerability.
- **Root Cause**: Unconditional fallback without environment validation.
- **Minimal Fix**: In `backend/src/config/env.js`, enforce that if `NODE_ENV === "production"`, `JWT_SECRET` must be defined and not equal to the default fallback, throwing an informative error at startup.

#### BUG-P1-06: Registration Controller Type Crash & Missing Email Format Validation
- **Severity**: P1 – High
- **Affected Files**: `backend/src/controllers/auth/index.js` (function `register`)
- **Description**: `register` assumed `email` and `name` are strings and called `.trim()` without type-checking. Passing numbers or objects caused unhandled TypeErrors. Additionally, invalid email patterns (e.g. "not-an-email") were accepted and written to the database.
- **Root Cause**: Missing type checks and regex email validation in controller.
- **Minimal Fix**: Validate `typeof name === "string"`, `typeof email === "string"`, and validate email against standard email regex format before calling string methods or querying database.

#### BUG-P1-07: Incomplete Studio Update Validation
- **Severity**: P1 – High
- **Affected Files**: `backend/src/controllers/studio/index.js` (function `updateStudio`, `createStudio`)
- **Description**: `updateStudio` permitted empty strings for `city`, `address`, and `description`, accepted `Infinity` for `hourlyRate` (since `Number(Infinity) > 0` and not NaN), and did not sanitize empty/whitespace elements in the `gear` equipment array.
- **Root Cause**: Incomplete partial update validation.
- **Minimal Fix**: In `updateStudio` and `createStudio`, enforce that `hourlyRate` is a finite positive number (`Number.isFinite(rate) && rate > 0`), check non-empty strings when fields are provided, and filter `gear` to remove empty items.

---

### P2 – Medium Severity Issues

#### BUG-P2-01: Sensitive Information Exposure: Provider Email in Public Studio Data
- **Severity**: P2 – Medium
- **Affected Files**: `backend/src/services/studio.service.js` (functions `getAllStudios`, `getStudioById`, `formatStudio`)
- **Description**: Public studio endpoints `GET /api/studios` and `GET /api/studios/:id` included the studio provider's private email address (`provider.email`) in the response object.
- **Root Cause**: Including `email: true` in the Prisma relation select for public studio queries.
- **Minimal Fix**: In public studio queries and `formatStudio`, only expose public provider metadata (`id`, `name`). Omit `email` from public responses.

#### BUG-P2-02: Silent API Failures Swallowed and Rendered as Empty States
- **Severity**: P2 – Medium
- **Affected Files**: `frontend/src/pages/provider/ProviderBookings.jsx`, `frontend/src/pages/creator/BrowseStudios.jsx`, `frontend/src/pages/provider/ProviderStudios.jsx`
- **Description**: In these pages, `.catch()` blocks silently swallowed API errors and executed `setStudios([])` or `setBookings([])` with no error state or notification, misleading users into believing no studios or bookings exist when the server is actually unreachable or returning an error.
- **Root Cause**: Missing `error` state and error banner/retry UI.
- **Minimal Fix**: Add `error` state in `ProviderBookings.jsx`, `BrowseStudios.jsx`, and `ProviderStudios.jsx`, render a clear error alert with a "Retry" button, and preserve separation between loading, empty, and failed states.

#### BUG-P2-03: CORS Configuration Port Support
- **Severity**: P2 – Medium
- **Affected Files**: `backend/src/app.js`
- **Description**: In local development, if port 5173 is occupied, Vite binds to port 5174. If the backend CORS origin whitelist only contains 5173, browser requests are blocked.
- **Root Cause**: Hardcoded origin whitelist without covering common Vite fallback ports (5173, 5174, 5175).
- **Minimal Fix**: Include `http://localhost:5173`, `http://localhost:5174`, `http://localhost:5175`, `http://127.0.0.1:5173`, `http://127.0.0.1:5174`, and `CLIENT_URL` in CORS allowed origins.

#### BUG-P2-04: Empty Skeleton Files in Backend Codebase
- **Severity**: P2 – Medium
- **Affected Files**: `backend/src/utils/AppError.js`, `backend/src/utils/asyncHandler.js`, `backend/src/validators/*`, `backend/src/middleware/rateLimiter.js`, `backend/src/routes/provider.routes.js`
- **Description**: Several 0-byte files existed in the codebase.
- **Resolution Plan**:
  - `AppError.js`: Implement a lightweight standard `AppError` class extending `Error`.
  - `asyncHandler.js`: Implement a simple express async wrapper utility.
  - `provider.routes.js`: Keep routes cleanly structured; provider endpoints are already correctly mounted in `booking.routes.js` and `studio.routes.js`. Document status clearly.
  - `validators/*` & `validate.js`: Keep validation cleanly modularized without unnecessary enterprise bloat, honoring `MY_CODING_STYLE.md`.

---

### P3 – Low Severity Issues

#### BUG-P3-01: Inaccurate Toast Notification on Booking Creation
- **Severity**: P3 – Low
- **Affected Files**: `frontend/src/pages/creator/BrowseStudios.jsx`
- **Description**: `BrowseStudios.jsx` displayed toast "Session Confirmed" upon booking submission, even though the booking is actually in `PENDING` status awaiting host approval.
- **Root Cause**: Copywriting mismatch with booking lifecycle.
- **Minimal Fix**: Update toast to "Booking Request Submitted" ("Requested booking for [Studio Name], pending provider confirmation").

#### BUG-P3-02: Documentation Discrepancies
- **Severity**: P3 – Low
- **Affected Files**: `README.md`, `backend/README.md`
- **Description**: Discrepancies regarding port numbers (5000 vs 5001) and setup instructions.
- **Root Cause**: Outdated documentation after port was shifted from 5000 to 5001 to resolve macOS AirPlay Receiver port collision.
- **Minimal Fix**: Reconcile documentation to consistently reference port `5001` for backend and `5173`/`5174` for frontend.

---

## 4. End-to-End Integration Mapping

| Operation | Frontend Trigger | Frontend Service | API Route | Backend Controller | DB Query / Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Register** | `Register.jsx:handleSubmit` | `authApi.register()` | `POST /api/auth/register` | `authController.register` | `prisma.user.create` |
| **Login** | `Login.jsx:handleLoginSubmit` | `authApi.login()` | `POST /api/auth/login` | `authController.login` | `prisma.user.findUnique` |
| **Current User** | `AuthContext.jsx:initAuth` | `authApi.getCurrentUser()` | `GET /api/auth/me` | `authController.getMe` | `prisma.user.findUnique` |
| **Activate Provider** | `ProtectedRoute.jsx:handleActivate` | `authApi.activateProvider()` | `POST /api/auth/activate-provider` | `authController.activateProvider` | `prisma.user.update(role: PROVIDER)` |
| **Browse Studios** | `BrowseStudios.jsx:useEffect` | `studioApi.getStudios()` | `GET /api/studios` | `studioController.listStudios` | `prisma.studio.findMany` |
| **Studio Details** | `BrowseStudios.jsx` modal | `studioApi.getStudioById()` | `GET /api/studios/:id` | `studioController.getStudio` | `prisma.studio.findUnique` |
| **Create Studio** | `CreateEditStudio.jsx:handleSubmit` | `studioApi.createStudio()` | `POST /api/studios` | `studioController.createStudio` | `prisma.studio.create` |
| **Update Studio** | `CreateEditStudio.jsx:handleSubmit` | `studioApi.updateStudio()` | `PUT /api/studios/:id` | `studioController.updateStudio` | `prisma.studio.update` |
| **Delete Studio** | `ProviderStudios.jsx:handleDelete` | `studioApi.deleteStudio()` | `DELETE /api/studios/:id` | `studioController.deleteStudio` | `prisma.booking.count` & `prisma.studio.delete` |
| **Create Booking** | `BrowseStudios.jsx:handleConfirmBooking` | `bookingApi.createBooking()` | `POST /api/bookings` | `bookingController.createBooking` | `SELECT FOR UPDATE` & `prisma.booking.create` |
| **Creator Bookings** | `CreatorBookings.jsx:useEffect` | `bookingApi.getCreatorBookings()` | `GET /api/bookings/creator` | `bookingController.getCreatorBookings` | `prisma.booking.findMany(creatorId)` |
| **Provider Bookings** | `ProviderBookings.jsx:useEffect` | `bookingApi.getProviderBookings()` | `GET /api/bookings/provider` | `bookingController.getProviderBookings` | `prisma.booking.findMany(providerId)` |
| **Confirm Booking** | `ProviderBookings.jsx:handleConfirmRequest` | `bookingApi.updateBookingStatus()` | `PATCH /api/bookings/:id/status` | `bookingController.updateStatus` | `prisma.booking.update(status: CONFIRMED)` |
| **Reject Booking** | `ProviderBookings.jsx:handleRejectRequest` | `bookingApi.updateBookingStatus()` | `PATCH /api/bookings/:id/status` | `bookingController.updateStatus` | `prisma.booking.update(status: REJECTED)` |
| **Complete Booking** | `ProviderBookings.jsx:handleCompleteBooking` | `bookingApi.updateBookingStatus()` | `PATCH /api/bookings/:id/status` | `bookingController.updateStatus` | `prisma.booking.update(status: COMPLETED)` |
| **Cancel Booking** | `CreatorBookings.jsx:handleConfirmCancel` | `bookingApi.cancelBooking()` | `PATCH /api/bookings/:id/cancel` | `bookingController.cancelBooking` | `prisma.booking.update(status: CANCELLED)` |

---

## 5. Execution & Remediation Strategy

Remediations will proceed in strict order:
1. **Phase 1: Backend Core Fixes (P0 & P1)**
   - Date, time, and calendar validation in `time.js` and `booking` controller.
   - Concurrency and status transitions in `booking.service.js`.
   - Studio deletion preservation rules and input validation in `studio` controller/service.
   - Authentication input sanitization and production JWT safety.
   - Body parser payload limits in `app.js`.
2. **Phase 2: Frontend & Integration Fixes (P0 & P1)**
   - Environment configurations (`.env`, `.env.example`).
   - Provider booking retrieval via dedicated `/bookings/provider` route.
   - Safe provider activation in `AuthContext.jsx`.
   - Provider rejection handler and UI in `ProviderBookings.jsx`.
   - Demo mode conflict detection and status synchronization.
3. **Phase 3: Error States, Security & Polish (P2 & P3)**
   - Provider email redaction from public studio endpoints.
   - Resilient error handling and retry buttons in frontend pages.
   - Implementation of utility classes (`AppError`, `asyncHandler`).
   - Copywriting and toast fixes.
4. **Phase 4: Automated Testing & Verification**
   - Execute existing tests.
   - Add comprehensive tests covering all newly patched business logic and edge cases.
   - Verify frontend lint and build pass without regressions.
