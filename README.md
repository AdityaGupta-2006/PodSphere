<div align="center">

# 🎙️ PodSphere

### *Connecting Creators with Podcast Recording Studios*

<img src="https://readme-typing-svg.demolab.com?font=Inter&weight=600&size=24&duration=3000&pause=1000&color=8B5CF6&center=true&vCenter=true&width=700&lines=Discover+Studios+%E2%86%92+Book+Recording+Slots;Manage+Studios+%E2%86%92+Confirm+Bookings;The+Podcast+Studio+Discovery+%26+Booking+Platform" alt="Typing Animation" />

<br/>

[![GitHub Stars](https://img.shields.io/github/stars/AdityaGupta-2006/PodSphere?style=for-the-badge&logo=github&color=8B5CF6)](https://github.com/AdityaGupta-2006/PodSphere/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/AdityaGupta-2006/PodSphere?style=for-the-badge&logo=github&color=6366F1)](https://github.com/AdityaGupta-2006/PodSphere/forks)
[![License](https://img.shields.io/badge/License-Academic-EC4899?style=for-the-badge)](#-license)
[![Status](https://img.shields.io/badge/Status-Evaluation%20Ready-10B981?style=for-the-badge)](#-roadmap)

<br/>

[✨ About](#-what-is-podsphere) •
[🎯 Problem](#-the-problem) •
[🚀 Features](#-features) •
[🧭 User Flows](#-user-flows) •
[⚙️ Logic](#-business-logic-edge-cases) •
[🏗️ Architecture](#-architecture) •
[🗄️ Database](#-database-architecture) •
[🛠️ Tech Stack](#-technology-stack) •
[📁 Project Structure](#-project-structure) •
[🚀 Setup](#-getting-started) •
[🗺️ Roadmap](#-roadmap) •
[👥 Team](#-team)

</div>

---

## 🌌 The Idea Behind PodSphere

Starting a podcast requires quality audio, acoustically treated spaces, and professional recording equipment.

```text
    💡 PODCAST IDEA ──▶ 🏢 FIND STUDIO ──▶ 📅 BOOK SLOT ──▶ 🎙️ RECORD SESSION
```

For most aspiring creators, finding and booking a local podcast studio is challenging:
* Pricing and available time slots are rarely published upfront.
* Communication happens across disjointed direct messages and phone calls.
* Studio hosts have to manually track reservations and risk double-booking slots.

### PodSphere solves this by connecting creators and studio providers directly.

Creators can discover listed studios and reserve recording slots, while studio providers get a dedicated workspace to manage listings and incoming bookings.

---

## ✨ What is PodSphere?

> **PodSphere** is a platform that connects podcast creators with recording studios. Creators can discover studios and book recording slots, while studio providers can list and manage their studios and handle incoming bookings.

Developed as a **Semester 3 college project**, PodSphere focuses on building a functional, intuitive full-stack web application with clean separation between Creator and Provider workflows.

> **Project Status Notice:** The application is fully functional end-to-end. It features dual-mode architecture supporting both standalone client-side demo mode (using browser local storage) and full-stack REST API mode powered by Express, PostgreSQL, and Prisma with JWT authentication.

---

## 🎯 The Problem

Creators looking for recording spaces and studio owners managing facilities face everyday friction:

```text
  CREATORS FACE:                          STUDIO PROVIDERS FACE:
  ❌ Hidden rates and equipment lists     ❌ Manual calendar and booking tracking
  ❌ Slow manual booking by phone or chat ❌ Double-booking and schedule overlaps
  ❌ No unified place to track sessions   ❌ No simple portal to manage listings
```

### With PodSphere

```text
                           PODSPHERE PLATFORM
                                   │
                 ┌─────────────────┴─────────────────┐
                 ▼                                   ▼
        CREATOR WORKSPACE                   PROVIDER WORKSPACE
                 │                                   │
      • Discover studios                  • List & edit studios
      • Check gear & rates                • Set hourly rates & gear
      • Book hourly slots                 • Review incoming bookings
      • Manage booking history            • Confirm, reject, or complete
```

---

## 🚀 Features

<table>
<tr>
<td width="50%" valign="top">

### 🎙️ Creator Workspace

Features available to podcast creators:

* **Authentication & Profiles:** Registration and login interfaces with client-side session persistence.
* **Creator Dashboard:** Overview of upcoming studio sessions, active gear rentals, and quick navigation links.
* **Studio Discovery:** Search studios by name, city, price range, and equipment tags.
* **Studio Details Modal:** Modal showing capacity, hourly rates, location, and equipment lists.
* **Booking Creation:** Interactive date selection and hourly time-slot picker with client-side availability checks.
* **Personal Bookings:** Booking history view with filter tabs (*Pending*, *Confirmed*, *Cancelled*, *Completed*).
* **Booking Cancellation:** Ability to cancel upcoming reservations with confirmation safeguards.
* **Equipment Marketplace:** Browse and filter professional podcast recording gear (microphones, audio interfaces, cameras, lighting) with real-time rate calculators.
* **Equipment Rentals Management:** View, track, and cancel gear rentals across lifecycle states (*Pending*, *Approved*, *Active*, *Returned*, *Completed*).
* **Workspace Switcher:** Instant switching between Creator and Provider views from the same session.

</td>

<td width="50%" valign="top">

### 🏢 Provider Workspace

Tools for studio providers to manage facilities, gear, and bookings:

* **Provider Dashboard:** Overview of listed studios, gear inventory, active requests, and studio status cards.
* **Provider Onboarding:** In-app access activation allowing creators to access provider tools without creating a separate account.
* **Studio Management (CRUD):**
  * Create new studio listings with pricing, address, description, and gear tags.
  * Edit existing studio details and update specifications.
  * Delete listings with confirmation safety dialogs (archived when booking history exists).
* **Equipment Inventory Management (CRUD):**
  * List gear with hourly or daily pricing, condition tags, specs, and multi-unit quantities.
  * Update rental rates, minimum/maximum rental hours, and stock availability.
  * Delete or archive gear listings while protecting historical rental records.
* **Incoming Booking Management:** Review studio requests with creator names, dates, and time slots.
* **Incoming Equipment Rental Management:** Review, approve, reject, mark active (picked up), returned, or completed for gear rental requests.
* **Status Controls:** Actions to confirm, reject, or mark sessions completed in the UI.
* **Schedule Oversight:** Visual indicators of confirmed and pending studio sessions and equipment bookings.

</td>
</tr>
</table>

---

## 🧭 User Flows

### 1️⃣ Creator Booking Flow

```text
  [ Browse Studios ]
          │
          ▼
  [ Search & Filter by City / Price / Gear ]
          │
          ▼
  [ Inspect Studio Details & Available Slots ]
          │
          ▼
  [ Select Date & Time Slot ]
          │
          ▼
  [ Client-Side Slot Availability Check ] ──▶ (Conflict) ──▶ [ Select Different Slot ]
          │ (Available)
          ▼
  [ Booking Created (Pending / Confirmed) ]
          │
          ▼
  [ View & Manage in My Bookings ]
```

### 2️⃣ Provider Studio Management Flow

```text
  [ Open Provider Console ]
          │
          ▼
  [ Create / Edit Studio Listing ]
  (Name, City, Address, Rate, Gear Tags)
          │
          ▼
  [ Studio Published to Directory ]
          │
          ▼
  [ Receive Incoming Booking Request ]
          │
          ▼
  [ Choose Action: Confirm ── Reject ── Mark Completed ]
```

---

## ⚙️ Business Logic & Edge Cases

### 📅 Booking Conflict Detection

To prevent double-booking a studio for the same time window:
* **Frontend (Implemented):** In standalone demo mode, client-side validation checks existing local bookings for the selected studio and blocks duplicate reservations for identical dates and time slots.
* **Backend (Implemented):** Server-side transaction validation enforces concurrency checks against the PostgreSQL database using pessimistic row locking (`SELECT ... FOR UPDATE`), serializing concurrent booking requests and returning HTTP 409 Conflict if an overlap occurs. Concurrency protection also guards status changes and cancellations.

```text
Creator selects studio, date & time slot
                   │
                   ▼
  Check existing bookings for studio
                   │
                   ▼
       ┌───────────────────────┐
       │   Slot Overlapping?   │
       └───────────┬───────────┘
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
       [ YES ]             [ NO ]
         │                   │
         ▼                   ▼
  Display conflict    Register booking
  error to creator    and update schedule
```

### 🔄 Booking Status Lifecycle

```text
               ┌───────────────┐
               │    PENDING    │
               └───────┬───────┘
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
      ┌─────────────┐     ┌─────────────┐
      │  CONFIRMED  │     │  REJECTED   │
      └──────┬──────┘     └─────────────┘
             │
     ┌───────┴───────┐
     ▼               ▼
┌───────────┐ ┌─────────────┐
│ COMPLETED │ │  CANCELLED  │
└───────────┘ └─────────────┘
```

#### Status Transition Rules:
- **`PENDING`**: Initial booking state created by a creator. Can transition to `CONFIRMED` or `REJECTED` by the studio host, or `CANCELLED` by the creator.
- **`CONFIRMED`**: Host approved the session. Can transition to `COMPLETED` by the host once the session finishes, or `CANCELLED` by the creator.
- **`REJECTED`**: Host declined the request. This is a terminal state.
- **`CANCELLED`**: Creator withdrew the session. This is a terminal state.
- **`COMPLETED`**: Session successfully finished. This is a terminal state.
- **Atomic Concurrency Protection**: All status updates and cancellations execute inside PostgreSQL transactions with row-level locks (`SELECT id, status FROM "Booking" WHERE id = :id::uuid FOR UPDATE`). If another request modifies the status concurrently, the server safely responds with `HTTP 409 Conflict`.

#### 💳 Booking Fee Display & Payment Scope Limitations:
- **UI Status Badge Derivation**: The frontend displays mock payment badge labels mapped directly from the booking lifecycle status:
  - `PENDING` ➔ `"HOLD PENDING"`
  - `CONFIRMED` ➔ `"PAID ESCROW"`
  - `COMPLETED` ➔ `"SETTLED"`
  - `CANCELLED` ➔ `"REFUNDED"`
  - `REJECTED` ➔ `"REJECTED"`
- **No Real Payment Processing or Escrow**: PodSphere is an academic capstone prototype. **No real payment gateway (such as Razorpay or Stripe), bank transfer integration, card processing, or financial escrow holding exists in the platform.** All monetary numbers represent calculated studio rental prices (hourly rate × booking duration), and all payment badges are purely cosmetic UI indicators reflecting the reservation's lifecycle status.

### 🛡️ Edge Cases & Implementation Status

* [x] **Client Route Protection:** Unauthenticated users are redirected from creator and provider routes on the frontend.
* [x] **Workspace Navigation:** Single-account workspace switcher toggling between Creator and Provider views.
* [x] **Client-Side Provider Activation:** Creators can activate provider tools directly in the UI without a separate registration.
* [x] **Action Safeguards:** Confirmation modal dialogs prevent accidental deletion of studio listings or cancellation of bookings.
* [x] **Responsive Viewport & Scrolling:** Accessible custom scrollbars and modal containers preventing content clipping on small screens.
* [x] **Backend Conflict Enforcement:** Database-level pessimistic row locking (`SELECT ... FOR UPDATE`) preventing concurrent duplicate bookings and atomic status updates returning 409 Conflict on race conditions.
* [x] **Backend Authorization Middleware:** Server-side JWT token and role validation on Express API endpoints with strict host ownership verification and provider privacy protection.

---

## 🏗️ Architecture

PodSphere follows a modular full-stack architecture:

```text
                       ┌─────────────────────────┐
                       │     CREATOR / HOST      │
                       └────────────┬────────────┘
                                    │
                                    ▼
                       ┌─────────────────────────┐
                       │     React Frontend      │
                       │   (Vite + Tailwind CSS) │
                       │       [IMPLEMENTED]     │
                       │                         │
                       │  • Creator Dashboard    │
                       │  • Studio Browser       │
                       │  • Provider Console     │
                       │  • Booking Modals       │
                       │  • Workspace Switcher   │
                       └────────────┬────────────┘
                                    │
                              REST API Calls
                          (Dual-Mode Client API)
                                    │
                                    ▼
                       ┌─────────────────────────┐
                       │     Express Backend     │
                       │       (Node.js)         │
                       │     [IMPLEMENTED]       │
                       │                         │
                       │  • Auth & JWT Routes    │
                       │  • Studio Controllers   │
                       │  • Booking Controllers  │
                       │  • Concurrency Locks    │
                       └────────────┬────────────┘
                                    │
                                Prisma ORM
                                    │
                                    ▼
                       ┌─────────────────────────┐
                       │   PostgreSQL Database   │
                       │     [OPERATIONAL]       │
                       │                         │
                       │  • Users Table          │
                       │  • Studios Table        │
                       │  • Bookings Table       │
                       └─────────────────────────┘
```

### Frontend vs Backend Status

* **Frontend (Implemented):** Built with React 19, Vite, React Router 7, and Tailwind CSS. All creator and provider views, modals, filters, and forms are fully interactive with accurate `Asia/Kolkata` date and slot handling.
* **Backend (Implemented):** Complete Express 5 REST API in `backend/src/` with PostgreSQL persistence via Prisma ORM, stateless JWT authentication, pessimistic row locking (`SELECT FOR UPDATE`) for double-booking and concurrent status transitions, strict CORS whitelist enforcement, and comprehensive automated test coverage.
* **Dual-Mode Client:**
  * **Standalone Mode (`VITE_USE_API=false`):** Runs the frontend using browser local storage and pre-seeded mock studio/booking data.
  * **API Mode (`VITE_USE_API=true`):** Connects to the Express backend (`http://localhost:5001/api`) with full PostgreSQL persistence.

---

## 🗄️ Database Architecture

The database schema is defined in [schema.prisma](backend/prisma/schema.prisma) targeting **PostgreSQL**.

```text
       ┌──────────────────┐
       │       User       │
       ├──────────────────┤
       │ id (UUID, PK)    │
       │ name             │
       │ email (Unique)   │
       │ passwordHash     │
       │ role (Role)      │
       └────────┬─────────┘
                │
        1:N     │        1:N
   ┌────────────┴─────────────┐
   ▼                          ▼
┌──────────────────┐   ┌──────────────────┐
│      Studio      │   │     Booking      │
├──────────────────┤   ├──────────────────┤
│ id (UUID, PK)    │1:N│ id (UUID, PK)    │
│ providerId (FK)  │───┼─▶ studioId (FK)  │
│ name             │   │ creatorId (FK)   │
│ description      │   │ startTime        │
│ city             │   │ endTime          │
│ address          │   │ totalAmount      │
│ hourlyRate       │   │ status (Status)  │
│ gear (String[])  │   └──────────────────┘
└──────────────────┘
```

### Database Models

| Model | Fields | Purpose |
| :--- | :--- | :--- |
| `User` | `id`, `name`, `email`, `passwordHash`, `role`, `createdAt`, `updatedAt` | Stores user account credentials and primary database role. |
| `Studio` | `id`, `providerId`, `name`, `description`, `city`, `address`, `hourlyRate`, `gear`, `isArchived`, `createdAt`, `updatedAt` | Represents recording studios listed by providers, including hourly rates and equipment. |
| `Booking` | `id`, `creatorId`, `studioId`, `startTime`, `endTime`, `totalAmount`, `status`, `createdAt`, `updatedAt` | Stores studio reservations linking creators and studios with date ranges. |
| `Equipment` | `id`, `providerId`, `name`, `category`, `brand`, `model`, `description`, `condition`, `city`, `address`, `hourlyRate`, `dailyRate`, `pricingUnit`, `minimumRentalHours`, `maximumRentalHours`, `totalQuantity`, `imageUrls`, `isActive`, `isArchived`, `createdAt`, `updatedAt` | Represents gear and hardware catalog items listed for rent with multi-unit stock and hourly/daily pricing. |
| `EquipmentRental` | `id`, `equipmentId`, `creatorId`, `providerId`, `startTime`, `endTime`, `quantity`, `rentalRate`, `pricingUnit`, `duration`, `totalAmount`, `status`, `notes`, `createdAt`, `updatedAt` | Stores equipment rental bookings with interval concurrency checks, multi-unit availability tracking, and lifecycle status transitions. |

### Schema Enums

* `Role`: `USER`, `PROVIDER`
* `BookingStatus`: `PENDING`, `CONFIRMED`, `REJECTED`, `CANCELLED`, `COMPLETED`
* `EquipmentCondition`: `NEW`, `LIKE_NEW`, `GOOD`, `FAIR`
* `RentalPricingUnit`: `HOURLY`, `DAILY`
* `EquipmentRentalStatus`: `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`, `ACTIVE`, `RETURNED`, `COMPLETED`

### Database Role vs Frontend Workspace

* **Database Role:** In PostgreSQL, each user is stored with a single `Role` enum value (`USER` or `PROVIDER`).
* **Active Frontend Workspace:** In the React UI, an authenticated user has an `activeWorkspace` state (`"creator"` or `"provider"`). This allows any account to explore both creator and provider views in the frontend. When the backend integration is completed, backend role authorization will validate whether the user has permission to perform provider mutations.

---

## 🧩 Technology Stack

<div align="center">

### Frontend
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router_7-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

### Backend & Database
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express_5-000000?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma_7-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

### Tooling & Environment
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)

</div>

---

## 📁 Project Structure

```text
PodSphere/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma           # Prisma PostgreSQL schema
│   │   └── seed.js                 # Idempotent demo seed script
│   ├── src/
│   │   ├── config/                 # Environment configurations & validation
│   │   ├── controllers/            # Request handlers (auth, studio, booking)
│   │   ├── middleware/             # Auth, role authorization, CORS, and error handlers
│   │   ├── routes/                 # Express REST endpoint declarations
│   │   ├── services/               # Business logic, transactions & row locking
│   │   ├── utils/                  # IST time conversion and JWT helpers
│   │   ├── db.js                   # Prisma client instance with PostgreSQL adapter
│   │   ├── app.js                  # Express app configuration & CORS setup
│   │   └── server.js               # Express server entry point
│   ├── tests/
│   │   └── system.test.js          # Native end-to-end system test suite (85+ assertions)
│   ├── .env.example                # Backend environment template
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── src/
│   │   ├── assets/                 # App assets and icons
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # Workspace state and authentication
│   │   │   └── authContextInstance.js
│   │   ├── hooks/
│   │   │   └── useAuth.js          # Auth consumer hook
│   │   ├── layouts/
│   │   │   └── DashboardLayout.jsx # Shell layout with workspace switcher
│   │   ├── pages/
│   │   │   ├── creator/
│   │   │   │   ├── BrowseStudios.jsx   # Studio discovery and booking modal
│   │   │   │   ├── CreatorBookings.jsx # Booking history and cancellations
│   │   │   │   └── CreatorDashboard.jsx# Creator metrics and shortcuts
│   │   │   ├── provider/
│   │   │   │   ├── CreateEditStudio.jsx# Studio create/edit form
│   │   │   │   ├── ProviderBookings.jsx# Incoming booking status controls
│   │   │   │   ├── ProviderDashboard.jsx# Provider metrics and summaries
│   │   │   │   └── ProviderStudios.jsx # Studio list and delete modal
│   │   │   └── public/
│   │   │       ├── Home.jsx        # Landing page
│   │   │       ├── Login.jsx       # Login form
│   │   │       └── Register.jsx    # Registration form
│   │   ├── routes/
│   │   │   ├── AppRoutes.jsx       # Route declarations
│   │   │   └── ProtectedRoute.jsx  # Client route protection
│   │   ├── services/
│   │   │   ├── api.js              # Fetch client wrapper
│   │   │   ├── authApi.js          # Auth client with standalone fallback
│   │   │   ├── bookingApi.js       # Booking operations and demo conflict logic
│   │   │   └── studioApi.js        # Studio CRUD operations
│   │   ├── App.jsx
│   │   ├── index.css               # Global styles and custom scrollbars
│   │   └── main.jsx                # React root mount
│   ├── .env.example                # Frontend environment template
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

Follow these steps to set up and run PodSphere on your local machine.

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/AdityaGupta-2006/PodSphere.git
cd PodSphere
```

---

### 2️⃣ Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_USE_API=false
```

> **Standalone Frontend Mode:**
> When `VITE_USE_API=false`, the frontend runs in standalone mode using browser storage and built-in mock studio/booking data. This allows complete UI testing without needing a running backend server or PostgreSQL database. Set `VITE_USE_API=true` once backend API endpoints are running.

Start the frontend development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5174` (or `http://localhost:5173`).

---

### 3️⃣ Backend Setup

Open a new terminal window:

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=5001
CLIENT_URL="http://localhost:5174"
DATABASE_URL="postgresql://username:password@localhost:5432/podsphere"
JWT_SECRET="your_jwt_secret_key_here"
```

---

### 4️⃣ Database Setup & Realistic Demo Seeding

Ensure your local PostgreSQL service is running on port 5432, then run Prisma and the seed script from inside `backend/`:

```bash
# Generate the Prisma client
npx prisma generate

# Push the schema to your PostgreSQL database
npx prisma db push

# Seed 10 realistic Indian podcast studios and demo accounts
npm run seed
```

#### 🔑 Pre-Configured Demo Credentials:

| Role | Email | Password | Coverage & Capabilities |
| :--- | :--- | :--- | :--- |
| **Provider 1** | `delhi.host@podsphere.demo` | `DemoHost123!` | Manages Delhi NCR & Gurugram studios; confirm/reject bookings |
| **Provider 2** | `noida.host@podsphere.demo` | `DemoHost123!` | Manages Noida, Mumbai & Bengaluru studios; complete sessions |
| **Creator** | `creator.demo@podsphere.demo` | `DemoCreator123!` | Explores 10 studios, filters by city/price, books future sessions |

---

### 5️⃣ Start the Backend Server

To start the backend server with automatic restart on file changes:

```bash
npm run dev
```

The server listens at `http://localhost:5001` with API routes prefixed by `/api`. Verify live status at `http://localhost:5001/api/health`.

---

## 🧪 Testing & Verification

### Frontend Verification

Run linting and production build checks in the `frontend` directory:

```bash
cd frontend

# Run ESLint code checks
npm run lint

# Verify production bundle build
npm run build
```

### Backend Verification

Run the comprehensive 88-assertion automated test suite in the `backend` directory:

```bash
cd backend

# Execute complete system tests (Health, Auth, Studios, Bookings, Concurrency, CORS, IST dates)
npm test
```

---

## 🗺️ Roadmap

```text
PHASE 01 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✅
Frontend & UI Architecture
├── Vite + React 19 setup
├── Responsive layouts & custom scrollbars
├── Dark-mode visual system
└── Interactive modal workflows

PHASE 02 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✅
Frontend Authentication & Workspaces
├── Client-side role handling (Creator & Provider)
├── Multi-workspace navigation switcher
├── In-app provider access activation
└── Session restoration & persistence

PHASE 03 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✅
Studio Discovery & Management (Frontend)
├── Studio discovery with keyword search
├── Location, price, and equipment filters
├── Provider studio listing CRUD (Create, Edit, Delete in client state)
└── Studio details modal with capacity & gear lists

PHASE 04 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✅
Booking System & Conflict Prevention
├── Interactive date & slot picker (Frontend UI: ✅)
├── Client-side slot overlap check (Frontend demo: ✅)
├── Creator personal booking history & cancellation (Frontend UI: ✅)
├── Provider booking status actions (Frontend UI: ✅)
└── Backend database conflict enforcement via row locking (Backend: ✅)

PHASE 05 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✅
Backend API Implementation
├── Express REST API routes & controllers
├── JWT authentication & authorization middleware
├── Input validation schemas & Indian timezone handling
└── Prisma database service layer (PostgreSQL)

PHASE 06 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✅
Frontend-Backend Integration
├── Connect frontend API service to Express endpoints
├── Seamless toggle via VITE_USE_API (demo vs API mode)
├── API error handling & network status alerts
└── End-to-end booking transactions with PENDING status

PHASE 07 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✅
Testing & Final Delivery
├── 69-assertion automated backend test suite (npm test)
├── Concurrency race condition verification (Promise.all)
├── Production build verification (npm run build)
└── Complete API documentation and guides
```

---

## 👥 Team

| Member | Responsibility |
| :--- | :--- |
| **Aditya Kumar Gupta** | Full-Stack Development |
| **Aniket Kumar** | Frontend / UI |
| **Anik Kumar Deo** | Backend / Database |
| **Muskan Praveen** | Research / Documentation |

---

## 📄 License

This project is developed as an **academic project** for Semester 3.

---

<div align="center">

<br/>

## 🎙️ PodSphere

### *Connecting Creators with Podcast Recording Studios.*

<br/>

**Built with ❤️ by the PodSphere Team.**

<br/>

⭐ **Star the repository if you find this project helpful!**

</div>
