<div align="center">

# 🎙️ PodSphere

### *Connecting Creators with Podcast Recording Studios*

<img src="https://readme-typing-svg.demolab.com?font=Inter&weight=600&size=24&duration=3000&pause=1000&color=8B5CF6&center=true&vCenter=true&width=700&lines=Discover+Studios+%E2%86%92+Book+Recording+Slots;Manage+Studios+%E2%86%92+Confirm+Bookings;The+Podcast+Studio+Discovery+%26+Booking+Platform" alt="Typing Animation" />

<br/>

[![GitHub Stars](https://img.shields.io/github/stars/AdityaGupta-2006/PodSphere?style=for-the-badge&logo=github&color=8B5CF6)](https://github.com/AdityaGupta-2006/PodSphere/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/AdityaGupta-2006/PodSphere?style=for-the-badge&logo=github&color=6366F1)](https://github.com/AdityaGupta-2006/PodSphere/forks)
[![License](https://img.shields.io/badge/License-Academic-EC4899?style=for-the-badge)](#-license)
[![Status](https://img.shields.io/badge/Status-In%20Development-F59E0B?style=for-the-badge)](#-roadmap)

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
* **Creator Dashboard:** Overview of upcoming sessions and quick navigation links.
* **Studio Discovery:** Search studios by name, city, price range, and equipment tags.
* **Studio Details Modal:** Modal showing capacity, hourly rates, location, and equipment lists.
* **Booking Creation:** Interactive date selection and hourly time-slot picker with client-side availability checks.
* **Personal Bookings:** Booking history view with filter tabs (*Pending*, *Confirmed*, *Cancelled*, *Completed*).
* **Booking Cancellation:** Ability to cancel upcoming reservations with confirmation safeguards.
* **Workspace Switcher:** Instant switching between Creator and Provider views from the same session.

</td>

<td width="50%" valign="top">

### 🏢 Provider Workspace

Tools for studio providers to manage facilities and bookings:

* **Provider Dashboard:** Overview of listed studios, active requests, and studio status cards.
* **Provider Onboarding:** In-app access activation allowing creators to access provider tools without creating a separate account.
* **Studio Management (CRUD):**
  * Create new studio listings with pricing, address, description, and gear tags.
  * Edit existing studio details and update specifications.
  * Delete listings with confirmation safety dialogs.
* **Incoming Booking Management:** Review requests with creator names, dates, and time slots.
* **Status Controls:** Actions to confirm, reject, or mark sessions completed in the UI.
* **Schedule Oversight:** Visual indicators of confirmed and pending studio sessions.

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
* **Backend (In Progress):** Server-side transaction validation to enforce concurrency checks against the PostgreSQL database is currently under development.

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

> **Note on Booking Statuses:** The frontend demo interface implements all five status states (*Pending*, *Confirmed*, *Rejected*, *Cancelled*, *Completed*). The existing database schema enum currently defines three states (`CONFIRMED`, `CANCELLED`, `COMPLETED`); extending the schema to include `PENDING` and `REJECTED` is part of the ongoing backend development.

### 🛡️ Edge Cases & Implementation Status

* [x] **Client Route Protection:** Unauthenticated users are redirected from creator and provider routes on the frontend.
* [x] **Workspace Navigation:** Single-account workspace switcher toggling between Creator and Provider views.
* [x] **Client-Side Provider Activation:** Creators can activate provider tools directly in the UI without a separate registration.
* [x] **Action Safeguards:** Confirmation modal dialogs prevent accidental deletion of studio listings or cancellation of bookings.
* [x] **Responsive Viewport & Scrolling:** Accessible custom scrollbars and modal containers preventing content clipping on small screens.
* [ ] **Backend Conflict Enforcement (In Progress):** Database-level transaction checks to prevent concurrent duplicate bookings on the server.
* [ ] **Backend Authorization Middleware (In Progress):** Server-side JWT token and role validation on Express API endpoints.

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
                       │     [IN PROGRESS]       │
                       │                         │
                       │  • Auth & JWT Routes    │
                       │  • Studio Controllers   │
                       │  • Booking Controllers  │
                       │  • Conflict Middleware  │
                       └────────────┬────────────┘
                                    │
                                Prisma ORM
                                    │
                                    ▼
                       ┌─────────────────────────┐
                       │   PostgreSQL Database   │
                       │     [SCHEMA READY]      │
                       │                         │
                       │  • Users Table          │
                       │  • Studios Table        │
                       │  • Bookings Table       │
                       └─────────────────────────┘
```

### Frontend vs Backend Status

* **Frontend (Implemented):** Built with React 19, Vite, React Router 7, and Tailwind CSS. All creator and provider views, modals, filters, and forms are fully interactive.
* **Backend (In Progress):** The Express structure in `backend/src/` contains initial scaffolding (route stubs, controller skeletons, middleware stubs, and utility helpers). The business logic and database-connected endpoints are currently being developed.
* **Dual-Mode Client:**
  * **Standalone Mode (`VITE_USE_API=false`):** Runs the frontend using browser local storage and pre-seeded mock studio/booking data. This allows complete UI testing without needing a running backend server or PostgreSQL database.
  * **API Mode (`VITE_USE_API=true`):** Configured to dispatch HTTP requests to the Express backend endpoints once backend implementation is completed.

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
| `Studio` | `id`, `providerId`, `name`, `description`, `city`, `address`, `hourlyRate`, `gear`, `createdAt`, `updatedAt` | Represents recording studios listed by providers, including hourly rates and equipment. |
| `Booking` | `id`, `creatorId`, `studioId`, `startTime`, `endTime`, `totalAmount`, `status`, `createdAt`, `updatedAt` | Stores studio reservations linking creators and studios with date ranges. |

### Schema Enums

* `Role`: `USER`, `PROVIDER`
* `BookingStatus`: `CONFIRMED`, `CANCELLED`, `COMPLETED`

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
│   │   └── schema.prisma           # Prisma PostgreSQL schema
│   ├── src/
│   │   ├── config/                 # Environment configurations
│   │   ├── controllers/            # Controller skeletons (in progress)
│   │   ├── middleware/             # Middleware stubs (in progress)
│   │   ├── prisma/                 # Prisma database client instance
│   │   ├── routes/                 # Route stubs (in progress)
│   │   ├── services/               # Service skeletons (in progress)
│   │   ├── utils/                  # Utility helpers
│   │   ├── validators/             # Validation skeletons (in progress)
│   │   ├── app.js                  # Express app definition
│   │   └── server.js               # Express server entry point
│   ├── .env.example                # Backend environment template
│   ├── package.json
│   └── prisma7.config.ts           # Prisma configuration
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

The application will be available at `http://localhost:5173`.

---

### 3️⃣ Backend Setup

Open a new terminal window:

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=5000
DATABASE_URL="postgresql://username:password@localhost:5432/podsphere"
JWT_SECRET="your_jwt_secret_key"
```

> **macOS Port Tip:** On macOS, port 5000 is often reserved by AirPlay Receiver (ControlCenter). If you encounter port conflicts, set `PORT=5001` in `backend/.env` and update `VITE_API_URL=http://localhost:5001/api` in `frontend/.env`.

---

### 4️⃣ Database Setup (PostgreSQL + Prisma)

Ensure your local PostgreSQL service is running, then run Prisma commands from inside the `backend` directory:

```bash
# Generate the Prisma client
npx prisma generate

# Push the schema to your PostgreSQL database
npx prisma db push
```

---

### 5️⃣ Start the Backend Server

To start the backend server directly:

```bash
node src/server.js
```

Or using `nodemon` for auto-restart during development:

```bash
npx nodemon src/server.js
```

> **Backend Status:** The server runs on port 5001 with active health check at `http://localhost:5001/api/health`. All authentication, studio management, and booking endpoints are fully operational.

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

Run the comprehensive 69-assertion automated test suite in the `backend` directory:

```bash
cd backend

# Execute complete system tests (Health, Auth, Studios, Bookings, Concurrency)
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
