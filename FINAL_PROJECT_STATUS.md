# PodSphere Final Project Status & Capstone Demonstration Guide

**Project**: PodSphere (Podcast Studio Discovery & Booking Platform)  
**Status**: Production-Stabilized & Evaluation-Ready  
**Evaluation Date**: November 24, 2026  
**Stack**: React 19, Vite, Tailwind CSS, Express 5, Prisma 7, PostgreSQL  

---

## 1. Verified Working Features

### A. Authentication & Role-Based Authorization
- **User Registration**: Creator and Provider onboarding with input validation (name, email regex, 6+ character passwords).
- **User Login**: Secure password authentication using `bcrypt` (10 rounds) and stateless JWT tokens.
- **Role Escalation**: Single-click Provider activation (`/api/auth/activate-provider`) upgrading database role to `PROVIDER` and issuing an escalated JWT.
- **Protected Routing**: Role-aware frontend route protection preventing unauthorized access to provider workspaces.

### B. Studio Discovery & Management
- **Public Studio Browsing**: Browse studio listings with real-time city filters, search term matching, and price caps.
- **Provider Studio Management**: Full CRUD operations (Create, Read, Update, Delete) for verified studio hosts.
- **Equipment & Photo Support**: Equipment roster management and studio image support up to 10MB payloads.
- **Data Protection**: Public listings protect provider privacy by redacting owner email addresses.
- **History Preservation**: Studios with booking history cannot be deleted, preserving audit and session records.

### C. Equipment Marketplace & Rental Engine
- **Gear Discovery & Filtering**: Search and filter recording hardware (microphones, mixers, cinema cameras, LED fixtures) by category, city, search keywords, condition, and maximum price.
- **Provider Equipment Management**: Full CRUD operations for providers to list hardware with hourly or daily pricing, minimum/maximum rental hours, specifications, and total inventory quantities.
- **Server-Side Rental Pricing**: Accurate calculation of billable rental units (hours or 24-hour days) and total price.
- **Pessimistic Inventory Locking & Concurrency Protection**: Interactive transaction with `SELECT ... FOR UPDATE` on `Equipment` serializes concurrent rental requests, computes overlapping interval reservations (`existing.startTime < requested.endTime AND existing.endTime > requested.startTime`), and rejects requests exceeding available stock with `HTTP 409 Conflict`.
- **Atomic Rental Status Transitions**: Row-level locking on `EquipmentRental` safely guards lifecycle updates:
  - `PENDING` -> Initial submission state.
  - `APPROVED` -> Provider approves reservation.
  - `ACTIVE` -> Gear picked up by creator.
  - `RETURNED` -> Gear returned to provider.
  - `COMPLETED` -> Provider completes and closes rental record.
  - `REJECTED` -> Provider rejects rental request with optional reason.
  - `CANCELLED` -> Creator cancels pending/approved rental before pickup.
- **Data Protection & Archival**: Equipment with historical completed/cancelled rentals is safely archived (`isArchived: true`) rather than deleted, protecting audit trails.

### D. Booking Engine & Lifecycle Management
- **Strict Booking Validation**: Rejects past dates, same-day past time slots, nonexistent calendar dates (e.g. Feb 31), and malformed time ranges.
- **Concurrency & Double-Booking Prevention**: Pessimistic row locking (`SELECT id FROM "Studio" ... FOR UPDATE`) prevents simultaneous duplicate reservations.
- **Atomic Booking Status Transitions**: Pessimistic row locking (`SELECT id, status FROM "Booking" ... FOR UPDATE`) guarantees race-condition safe status updates and cancellations with `HTTP 409 Conflict` on contention.
- **Complete Booking Lifecycle**:
  - `PENDING` -> Initial submission state.
  - `CONFIRMED` -> Provider confirms reservation.
  - `REJECTED` -> Provider rejects reservation (terminal state).
  - `CANCELLED` -> Creator cancels pending/confirmed session (terminal state).
  - `COMPLETED` -> Provider marks recording session completed (terminal state).
- **Dual Console Separation**:
  - Creator Console displays personal bookings.
  - Provider Console displays incoming reservations for owned studios.

---

## 2. Realistic Demo Data & Credentials

PodSphere includes an idempotent database seeding script that provisions 10 realistic Indian podcast studios, 2 demo hosts, 1 demo creator, and sample future bookings without touching real user accounts.

### Seeding Command:
```bash
cd backend
npm run seed
```

### Pre-Configured Evaluation Accounts:
| Role | Email | Password | Location / Focus |
| :--- | :--- | :--- | :--- |
| **Provider 1** | `delhi.host@podsphere.demo` | `DemoHost123!` | Manages Delhi NCR & Gurugram studios |
| **Provider 2** | `noida.host@podsphere.demo` | `DemoHost123!` | Manages Noida, Mumbai & Bengaluru studios |
| **Creator** | `creator.demo@podsphere.demo` | `DemoCreator123!` | Studio discovery, filtering, and booking |

---

## 2. Environment Requirements & Configuration

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **PostgreSQL**: v14.0 or higher running on port `5432`
- **npm**: v9.0.0 or higher

### Backend `.env` (`backend/.env`)
```env
PORT=5001
CLIENT_URL="http://localhost:5174"
DATABASE_URL="postgresql://adityakumargupta@localhost:5432/podsphere"
JWT_SECRET="your_jwt_secret_key_here"
```

### Frontend `.env` (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5001/api
VITE_USE_API=true
```

---

## 3. Exact Startup Commands

### Step 1: Ensure PostgreSQL is Running
```bash
# Verify PostgreSQL is accepting connections
pg_isready
```

### Step 2: Start the Backend API Server
```bash
cd backend
npm run dev
# Backend starts on http://localhost:5001
```

### Step 3: Start the Frontend Development Server
```bash
cd frontend
npm run dev
# Frontend starts on http://localhost:5174 (or http://localhost:5173)
```

### Step 4: Run the Complete Automated Test Suite
```bash
cd backend
npm test
# Runs 88 automated system, lifecycle, CORS, IST date, and concurrency assertions
```

---

## 4. Recommended Capstone Demonstration Sequence

Follow this step-by-step sequence to deliver a flawless evaluation demonstration:

### Step 1: Health & Database Connectivity Check
- Open browser at `http://localhost:5001/api/health`.
- Point out the JSON response:
  ```json
  {
    "status": "ok",
    "database": "connected",
    "message": "PodSphere API and database are operational"
  }
  ```
- Mention that the backend is powered by Node.js, Express, and Prisma communicating with PostgreSQL.

### Step 2: Creator Studio Discovery
- Open frontend at `http://localhost:5174/`.
- Navigate to **"Browse Studios"** (`/creator/studios`).
- Demonstrate filtering:
  - Select City: **"Delhi"**.
  - Select Max Price: **"≤ ₹1,600 / hr"**.
  - Search for **"Echo"** or **"Lab"**.
- Click **"View Details"** on a studio to showcase the equipment roster and studio specs.

### Step 3: Creator Booking Submission & Date/Time Validation
- On a studio modal, attempt to select an invalid or past slot (e.g., today at an earlier hour) -> show the validation error: *"Cannot book a time slot in the past."*
- Select a valid future date and time slot (e.g., tomorrow 10:00 AM - 12:00 PM).
- Click **"Confirm Booking"** -> show the confirmation toast: *"Booking Request Submitted (Pending host approval)"*.
- Navigate to **"My Bookings"** (`/creator/bookings`) and show the booking listed in **PENDING** status.

### Step 4: Provider Workspace & Role Escalation
- Click user profile / workspace switcher in the sidebar and choose **"Provider Workspace"** (or click **"Activate Provider Access"** if using a new account).
- Show that provider privileges are authenticated and verified on the server.
- Navigate to **"Provider Console • Incoming Bookings"** (`/provider/bookings`).
- Highlight that the creator's reservation appears in the provider console with status **PENDING**.

### Step 5: Provider Decision (Confirm or Reject)
- Show both action buttons: **"Confirm"** and **"Reject"**.
- Click **"Confirm"** -> status transitions to **CONFIRMED** with UI badge displaying `"PAID ESCROW"`.
- Show that after the session takes place, the provider can click **"Mark as Completed"** to finalize the reservation.

### Step 6: Concurrency & Conflict Prevention Explanation
- Explain to the evaluation committee that PodSphere uses PostgreSQL row-level locks (`SELECT FOR UPDATE`) inside Prisma transactions.
- Run `npm test` in the terminal to show all **88 assertions** passing in real time, specifically highlighting the race condition test:
  - *"Pessimistic row lock handles concurrent race: 1 wins (201), 1 rejected (409)"*.

---

## 5. Known Limitations & Safe Architectural Boundaries

1. **Email / SMS Notifications**: Not included in this release per strict scope guidelines; status updates are viewed directly within creator and provider dashboards.
2. **Third-Party Payment Gateways & Real Escrow**: Intentionally omitted to prioritize stability and avoid external live billing dependencies during evaluation. Payment badges (e.g. `'HOLD PENDING'`, `'PAID ESCROW'`, `'SETTLED'`, `'REFUNDED'`) are purely calculated UI status labels mapped from booking status flags in the database; no real financial transactions, payment gateways, or bank escrow accounts exist. All monetary figures represent calculated rental rack rates (hourly rate × duration).
3. **Image Storage**: Base64 image strings are stored directly with a 10MB payload limit, avoiding third-party S3/Cloudinary configuration overhead.
