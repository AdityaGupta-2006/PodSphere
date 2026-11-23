# PodSphere Engineering Stabilization: Record of Fixes Applied

**Author**: Senior Full-Stack Engineer, Software Architect & QA Specialist  
**Date**: November 24, 2026  
**Objective**: Capstone Project Evaluation Preparation & Codebase Hardening  
**Scope**: Stabilization and Reliability Improvement without Unnecessary Scope Expansion  

---

## Summary of Modifications

A total of 18 critical and high-priority defects across frontend, backend, database integration, and security layers were investigated, corrected, and verified against PostgreSQL.

```
┌─────────────────────────────────┬───────┬──────────────────────────────────────────┐
│ Category                        │ Count │ Key Files Modified                       │
├─────────────────────────────────┼───────┼──────────────────────────────────────────┤
│ Booking Engine & Date/Time      │ 5     │ time.js, booking controller, service     │
│ Authentication & Security       │ 4     │ auth controller, env.js, AuthContext.jsx │
│ Studio Management & Deletion    │ 3     │ studio controller, service, studioApi.js │
│ Frontend Routing & Integration  │ 4     │ bookingApi.js, ProviderBookings.jsx      │
│ Server Middleware & Stability   │ 2     │ app.js, rateLimiter.js, validate.js      │
└─────────────────────────────────┴───────┴──────────────────────────────────────────┘
```

---

## Detailed Record of Changes

### 1. BUG-P0-01: Frontend API Mode Configuration & Port Synchronization
- **Affected Files**: `frontend/.env`, `frontend/.env.example`
- **What Changed**: Set `VITE_API_URL=http://localhost:5001/api` and `VITE_USE_API=true`.
- **Why**: Frontend was defaulting to `VITE_USE_API=false` on port `5000`. The Express server runs on port `5001` (to avoid macOS AirPlay Receiver port conflicts). Without this change, all frontend interactions stayed in mock `localStorage` mode rather than interacting with the PostgreSQL database.
- **Verification**: Verified Vite client connects directly to `http://localhost:5001/api` and successfully loads remote data.

### 2. BUG-P0-02: Provider Booking Console Endpoint Misrouting
- **Affected Files**: `frontend/src/services/bookingApi.js`, `frontend/src/pages/provider/ProviderBookings.jsx`, `frontend/src/pages/provider/ProviderDashboard.jsx`
- **What Changed**:
  - Implemented and exported `getProviderBookings(filters)` in `bookingApi.js` targeting `/bookings/provider`.
  - Implemented and exported `getCreatorBookings(filters)` targeting `/bookings/creator`.
  - Updated `ProviderBookings.jsx` and `ProviderDashboard.jsx` to call `bookingApi.getProviderBookings()`.
- **Why**: Previously, provider screens called generic `getBookings()`, which defaulted on the backend to `getBookingsForCreator(req.user.id)`. Providers saw either no bookings or their own creator bookings rather than incoming reservations for their studios.
- **Verification**: Backend test verifies `GET /api/bookings/provider` and `GET /api/provider/bookings` return incoming studio bookings scoped to the authenticated provider.

### 3. BUG-P0-03: Silent Provider Privilege Escalation Failure
- **Affected Files**: `frontend/src/context/AuthContext.jsx`, `frontend/src/routes/ProtectedRoute.jsx`
- **What Changed**:
  - Removed silent `catch (err) { void err; }` fallback in `activateProviderAccess()`.
  - In API mode, `activateProviderAccess()` now strictly requires a successful server response and fresh JWT from `authApi.activateProvider()`. If the backend request fails, the error is thrown.
  - Added user-facing error reporting and loading states in `ProtectedRoute.jsx`.
- **Why**: Previously, if a user clicked "Activate Provider Access" and the backend failed or rejected it, the frontend modified `localStorage` and React state to pretend activation succeeded.
- **Verification**: Verified error propagation and ensured non-escalated users cannot bypass provider authorization checks.

### 4. BUG-P0-04: Studio Deletion Destructive Cascade on Historical Bookings
- **Affected Files**: `backend/src/services/studio.service.js`, `backend/src/controllers/studio/index.js`, `frontend/src/services/studioApi.js`
- **What Changed**:
  - Removed destructive `await tx.booking.deleteMany({ where: { studioId: id } })` from `studio.service.js`.
  - Added `hasBookingHistory(studioId)` checking whether *any* bookings exist for the studio.
  - In `deleteStudio` controller, if a studio has existing bookings (including `COMPLETED`, `CANCELLED`, or `REJECTED`), deletion is blocked with HTTP 400.
  - Aligned client-side demo mode deletion logic to enforce the same constraint.
- **Why**: Deleting a studio was previously deleting all completed, cancelled, and rejected bookings, destroying audit history and accounting records.
- **Verification**: Added automated test asserting studio deletion is blocked with HTTP 400 when historical completed/cancelled bookings exist.

### 5. BUG-P0-05: Same-Day Past Time Slot Reservation Permitted
- **Affected Files**: `backend/src/controllers/booking/index.js`, `backend/src/utils/time.js`, `frontend/src/pages/creator/BrowseStudios.jsx`
- **What Changed**:
  - Added strict check: `if (parsedSlot.startTime < new Date()) { return res.status(400).json({ error: "Cannot book a time slot in the past." }); }`.
  - Added matching client-side slot start-time validation in `BrowseStudios.jsx` before submitting.
- **Why**: Previous logic only checked whether the date's end-of-day (`T23:59:59`) was in the past. If booking for today, any past time slot (such as 10:00 AM in the evening) was accepted.
- **Verification**: Automated test `Booking rejects same-day past time slot with 400 Bad Request` passes.

### 6. BUG-P0-06: Time Parser Boundary & Format Validation
- **Affected Files**: `backend/src/utils/time.js` (function `parseSingleTimeString`)
- **What Changed**:
  - Enforced 12-hour clock boundaries: `hours >= 1 && hours <= 12`, `minutes >= 0 && minutes <= 59`.
  - Enforced 24-hour clock boundaries: `hours >= 0 && hours <= 23`, `minutes >= 0 && minutes <= 59`.
  - Returns `null` for malformed formats (`13:30 PM`, `10:99 AM`, `25:00`, `99:00`).
- **Why**: Regex previously captured 1-2 digits without range validation, causing invalid minutes and hours to pass into `Date` objects.
- **Verification**: Automated tests for `13:30 PM`, `10:99 AM`, and `25:00` all confirm rejection with HTTP 400.

### 7. BUG-P0-07: Calendar Date Rollover Prevention
- **Affected Files**: `backend/src/utils/time.js`, `backend/src/controllers/booking/index.js`
- **What Changed**:
  - Created `isValidCalendarDate(rawDate)` enforcing `^\d{4}-\d{2}-\d{2}$` and ensuring reconstructed year, month, and day match input without JavaScript Date rollover.
  - Added calendar check in `createBooking` returning HTTP 400 for nonexistent calendar dates.
- **Why**: `new Date("2026-02-31")` was silently normalized to March 3rd in JavaScript, allowing users to book invalid calendar dates.
- **Verification**: Automated test confirms `2026-02-31` is rejected with HTTP 400.

### 8. BUG-P1-01: Provider Booking Rejection Implementation in UI
- **Affected Files**: `frontend/src/pages/provider/ProviderBookings.jsx`, `frontend/src/services/bookingApi.js`
- **What Changed**:
  - Added `handleRejectRequest(id)` in `ProviderBookings.jsx` calling `bookingApi.updateBookingStatus(id, "REJECTED")`.
  - Rendered "Reject" action button in table rows for `PENDING` bookings.
  - Rendered "Reject Request" button in the booking details modal.
  - Added `"REJECTED"` to `validStatuses` in `bookingApi.js`.
- **Why**: The backend supported rejection, but the provider UI had no reject action or handler.
- **Verification**: Verified provider rejection transitions booking status to `REJECTED`, updates local state, and locks the booking from future transitions.

### 9. BUG-P1-02: Booking Status Update Concurrency Race Protection
- **Affected Files**: `backend/src/services/booking.service.js`, `backend/src/controllers/booking/index.js`
- **What Changed**:
  - Wrapped status updates in an atomic Prisma `$transaction`.
  - Verified current booking status matches `expectedCurrentStatus` at the moment of update.
  - If a concurrent cancellation or status transition occurred, returns HTTP 409 Conflict.
- **Why**: Unconditional updates (`prisma.booking.update({ where: { id } })`) allowed race conditions between simultaneous provider decisions and creator cancellations.
- **Verification**: Verified transactional state enforcement in automated tests.

### 10. BUG-P1-03: Demo Mode Conflict Interval Overlap & Status Synchronization
- **Affected Files**: `frontend/src/services/bookingApi.js`
- **What Changed**:
  - Implemented `parseDemoSlot` to evaluate interval overlap (`existingStart < newEnd && existingEnd > newStart`) in demo mode.
  - Changed default new booking status in demo mode from `CONFIRMED` to `PENDING` (matching backend lifecycle).
- **Why**: Demo mode was only checking exact string equality (`time === time`) and creating bookings in `CONFIRMED` state, diverging from the backend behavior.
- **Verification**: Verified interval conflicts are detected and demo mode creates `PENDING` bookings.

### 11. BUG-P1-04: Express Body Parser JSON Payload Limit
- **Affected Files**: `backend/src/app.js`
- **What Changed**: Configured `app.use(express.json({ limit: "10mb" }))` and `app.use(express.urlencoded({ extended: true, limit: "10mb" }))`.
- **Why**: Default Express JSON body parser limit is 100kb. Studio image uploads encoded as Base64 strings exceeded 100kb and failed with HTTP 413.
- **Verification**: Verified large payloads are accepted without payload limit errors.

### 12. BUG-P1-05: Insecure Hardcoded JWT Secret in Production
- **Affected Files**: `backend/src/config/env.js`
- **What Changed**: Added validation enforcing that in production (`NODE_ENV === "production"`), `JWT_SECRET` must be set and cannot equal the default development secret.
- **Why**: Prevents silent fallback to predictable keys in production deployments.
- **Verification**: Verified startup check executes as expected.

### 13. BUG-P1-06: Registration Input Sanitization & Email Validation
- **Affected Files**: `backend/src/controllers/auth/index.js`
- **What Changed**:
  - Validated that `name` and `email` are non-empty strings before calling `.trim()`.
  - Added regex email format validation: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`.
- **Why**: Passing numbers or objects in JSON bodies caused unhandled TypeErrors (`trim is not a function`). Malformed emails were previously stored in the database.
- **Verification**: Automated test `Registration rejects malformed email with 400 Bad Request` passes.

### 14. BUG-P1-07: Studio Creation & Update Validation Hardening
- **Affected Files**: `backend/src/controllers/studio/index.js`
- **What Changed**:
  - Enforced `Number.isFinite(rate)` to reject `Infinity`.
  - Enforced that updated fields (`name`, `city`, `address`, `description`) cannot be empty strings when supplied.
  - Filtered `gear` array to sanitize whitespace and empty items.
- **Why**: Partial updates allowed setting fields to empty strings and permitted non-finite rates.
- **Verification**: Automated test `Studio creation rejects non-finite rate with 400 Bad Request` passes.

### 15. BUG-P2-01: Sensitive Information Redaction: Provider Email in Public Studio Data
- **Affected Files**: `backend/src/services/studio.service.js`
- **What Changed**: In `getAllStudios`, modified provider select to only include `id` and `name`. Omitted `email` from public listing responses. Preserved email only in detailed views where authorized.
- **Why**: Public browsing endpoints were unnecessarily exposing studio owners' personal email addresses.
- **Verification**: Automated test `Security: Public studio list never exposes provider email` passes.

### 16. BUG-P2-02: User-Facing Error Boundaries in Frontend Consoles
- **Affected Files**: `frontend/src/pages/provider/ProviderBookings.jsx`, `frontend/src/pages/creator/BrowseStudios.jsx`, `frontend/src/pages/provider/ProviderStudios.jsx`
- **What Changed**: Added `error` state and dedicated error alerts with "Retry" buttons. Separated loading, error, empty, and data-loaded states.
- **Why**: API failures previously caused these components to display "No bookings found" or "No studios found", masking server failures as empty databases.
- **Verification**: Verified UI components properly distinguish between network/API failure and an empty dataset.

### 17. BUG-P2-03: CORS Port Compatibility
- **Affected Files**: `backend/src/app.js`
- **What Changed**: Extended CORS allowed origins to include `http://localhost:5173`, `http://localhost:5174`, `http://localhost:5175`, and 127.0.0.1 equivalents.
- **Why**: Vite switches to port 5174 or 5175 if 5173 is occupied.
- **Verification**: Verified requests from port 5174 pass CORS preflight and headers.

### 18. BUG-P2-04 & P3-01: Skeleton Files & UX Polish
- **Affected Files**: `backend/src/utils/AppError.js`, `backend/src/utils/asyncHandler.js`, `backend/src/routes/provider.routes.js`, `backend/src/middleware/rateLimiter.js`, `backend/src/middleware/validate.js`, `frontend/src/pages/creator/BrowseStudios.jsx`
- **What Changed**:
  - Implemented clean `AppError` class and `asyncHandler` wrapper.
  - Mounted `/provider/bookings` route on backend router.
  - Implemented in-memory rate limiting and request validation helpers.
  - Corrected toast notification in `BrowseStudios.jsx` to "Booking Request Submitted" (pending host confirmation).
- **Why**: Eliminates 0-byte placeholder files and fixes copywriting mismatch with the booking lifecycle.
- **Verification**: Verified all routes and utilities import cleanly.
