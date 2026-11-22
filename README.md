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

Creators can discover vetted studios and reserve recording slots in minutes, while studio providers get a dedicated workspace to manage listings and incoming bookings.

---

## ✨ What is PodSphere?

> **PodSphere** is a platform that connects podcast creators with recording studios. Creators can discover studios and book recording slots, while studio providers can list and manage their studios and handle incoming bookings.

Developed as a **Semester 3 college project**, PodSphere focuses on building a functional, intuitive full-stack web application with clean separation between creator and provider workflows.

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

Everything a podcast creator needs to find and book a studio:

* **Authentication & Profiles:** Secure registration, login, and profile persistence.
* **Creator Dashboard:** Summary of upcoming recording sessions and quick navigation.
* **Studio Discovery:** Search studios by name, city, price range, and available gear.
* **Studio Details Modal:** Detailed views showing capacity, hourly rates, addresses, and gear lists (e.g., 4K Cameras, Soundproofing, Rode PodMics).
* **Booking System:** Select dates and hourly time slots with automated conflict detection.
* **Personal Bookings:** View booking history with status filters (*Pending*, *Confirmed*, *Cancelled*, *Completed*).
* **Booking Cancellation:** Cancel upcoming eligible reservations with confirmation safeguards.
* **Workspace Switcher:** Seamlessly switch to provider tools with the same account.

</td>

<td width="50%" valign="top">

### 🏢 Provider Workspace

Tools for studio owners to manage their spaces and clients:

* **Provider Dashboard:** Overview of total studios listed, active booking requests, and studio status.
* **Provider Onboarding:** Self-service activation allowing creators to unlock provider tools without creating a separate account.
* **Studio Management (CRUD):**
  * Create new studio listings with pricing, address, amenities, and equipment tags.
  * Edit existing studio details and update gear specs.
  * Delete listings with confirmation safety dialogs.
* **Incoming Booking Management:** Review requests with creator details, dates, and times.
* **Status Controls:** Confirm, reject, or mark completed sessions as bookings progress.
* **Schedule Oversight:** Prevent conflicting requests on provider facilities.

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
  [ Automated Conflict Check Passed? ] ──▶ (No) ──▶ [ Select Different Slot ]
          │ (Yes)
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

PodSphere addresses key real-world scheduling and permission scenarios:

### 📅 Booking Conflict Detection

Before any booking is saved, the system verifies that the requested studio is not already reserved during the chosen time window:

```text
Creator selects studio, date & time slot
                   │
                   ▼
  Query existing bookings for studio
                   │
                   ▼
       ┌───────────────────────┐
       │ Conflict Detected?    │
       └───────────┬───────────┘
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
       [ YES ]             [ NO ]
         │                   │
         ▼                   ▼
  Display conflict    Create booking
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

### 🛡️ Edge Cases Handled

* [x] **Slot Overlap Prevention:** Prevents double-booking the same studio at overlapping hours.
* [x] **Role-Based Routing:** Unauthenticated users cannot access creator or provider pages.
* [x] **Workspace Navigation:** Users can toggle between Creator and Provider views without logging out.
* [x] **Provider Access Activation:** Creators can activate provider permissions directly from the interface.
* [x] **Deletion Safeguards:** Modals require explicit confirmation before deleting studios or cancelling bookings.
* [x] **Scroll & Viewport Integrity:** Modals and long data tables maintain responsive scrolling across small displays.

---

## 🏗️ Architecture

PodSphere follows a modular full-stack architecture with clear separation of concerns:

```text
                       ┌─────────────────────────┐
                       │     CREATOR / HOST      │
                       └────────────┬────────────┘
                                    │
                                    ▼
                       ┌─────────────────────────┐
                       │     React Frontend      │
                       │   (Vite + Tailwind CSS) │
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
                       │  (Users, Studios,       │
                       │   Bookings)             │
                       └─────────────────────────┘
```

### Dual-Mode Frontend Architecture

To ensure the user interface is testable even without an active PostgreSQL instance running:
* **Standalone Mode (`VITE_USE_API=false`):** Uses browser local storage with pre-seeded studios and bookings, allowing full UI exploration and testing.
* **API Mode (`VITE_USE_API=true`):** Communicates with the Express backend REST endpoints.

---

## 🗄️ Database Architecture

The database schema is defined using **Prisma ORM** targeting **PostgreSQL**.

```text
       ┌──────────────────┐
       │       User       │
       ├──────────────────┤
       │ id (UUID, PK)    │
       │ name             │
       │ email (Unique)   │
       │ passwordHash     │
       │ role (Enum)      │
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
│ hourlyRate       │   │ status (Enum)    │
│ gear (String[])  │   └──────────────────┘
└──────────────────┘
```

### Database Models

| Model | Fields | Purpose |
| :--- | :--- | :--- |
| `User` | `id`, `name`, `email`, `passwordHash`, `role`, `createdAt`, `updatedAt` | Stores user credentials and primary role (`USER` or `PROVIDER`). |
| `Studio` | `id`, `providerId`, `name`, `description`, `city`, `address`, `hourlyRate`, `gear`, `createdAt`, `updatedAt` | Represents recording studios listed by providers, including hourly rates and gear tags. |
| `Booking` | `id`, `creatorId`, `studioId`, `startTime`, `endTime`, `totalAmount`, `status`, `createdAt`, `updatedAt` | Stores reservations linking creators and studios with date ranges and statuses. |

### Schema Enums

* `Role`: `USER`, `PROVIDER`
* `BookingStatus`: `CONFIRMED`, `CANCELLED`, `COMPLETED` *(Frontend also supports `PENDING` and `REJECTED` workflows)*

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
│   │   ├── controllers/            # Route controllers (auth, booking, studio)
│   │   ├── middleware/             # Auth, error handling, rate limiting
│   │   ├── prisma/                 # Prisma database client instance
│   │   ├── routes/                 # Express REST route definitions
│   │   ├── services/               # Database query and business logic layer
│   │   ├── utils/                  # Async handlers, JWT, and time helpers
│   │   ├── validators/             # Request payload validation schemas
│   │   ├── app.js                  # Express application setup
│   │   └── server.js               # Server entry point
│   ├── .env.example                # Backend environment template
│   ├── package.json
│   └── prisma7.config.ts           # Prisma CLI configuration
│
├── frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── src/
│   │   ├── assets/                 # App assets and icons
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # Workspace, role, and auth state
│   │   │   └── authContextInstance.js
│   │   ├── hooks/
│   │   │   └── useAuth.js          # Authentication hook
│   │   ├── layouts/
│   │   │   └── DashboardLayout.jsx # Sidebar, breadcrumbs & workspace switcher
│   │   ├── pages/
│   │   │   ├── creator/
│   │   │   │   ├── BrowseStudios.jsx   # Studio discovery & booking modal
│   │   │   │   ├── CreatorBookings.jsx # Personal bookings & cancellations
│   │   │   │   └── CreatorDashboard.jsx# Creator metrics & quick links
│   │   │   ├── provider/
│   │   │   │   ├── CreateEditStudio.jsx# Studio creation & editing form
│   │   │   │   ├── ProviderBookings.jsx# Incoming requests & status controls
│   │   │   │   ├── ProviderDashboard.jsx# Host metrics & requests summary
│   │   │   │   └── ProviderStudios.jsx # Studio inventory & deletion modal
│   │   │   └── public/
│   │   │       ├── Home.jsx        # Landing page
│   │   │       ├── Login.jsx       # Login form
│   │   │       └── Register.jsx    # Registration form
│   │   ├── routes/
│   │   │   ├── AppRoutes.jsx       # Route declarations
│   │   │   └── ProtectedRoute.jsx  # Route protection & provider activation
│   │   ├── services/
│   │   │   ├── api.js              # Fetch client wrapper
│   │   │   ├── authApi.js          # Auth requests with standalone fallback
│   │   │   ├── bookingApi.js       # Booking operations & conflict logic
│   │   │   └── studioApi.js        # Studio CRUD operations
│   │   ├── App.jsx
│   │   ├── index.css               # Global styles & custom scrollbars
│   │   └── main.jsx                # Application root mount
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

> **Note on Standalone Mode:**
> When `VITE_USE_API=false`, the frontend runs in standalone mode using browser storage and built-in mock studios. This allows full UI testing without needing a running backend or database. Set `VITE_USE_API=true` when connecting to the Express server.

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

Ensure your local PostgreSQL server is running, then run Prisma commands from inside the `backend` directory:

```bash
# Generate the Prisma client
npx prisma generate

# Synchronize database schema
npx prisma db push
```

---

### 5️⃣ Start the Backend Server

```bash
npm run dev
```

The backend server will run on `http://localhost:5000` (or your configured port).

---

## 🧪 Testing & Verification

### Frontend Verification

Run linting and production build checks in the `frontend` directory:

```bash
cd frontend

# Run ESLint checks
npm run lint

# Verify production build
npm run build
```

### Backend Verification

```bash
cd backend

# Run backend test suite
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
Authentication & Workspaces
├── Role-based access control (Creator & Provider)
├── Multi-workspace navigation switcher
├── In-app provider access activation
└── Session restoration & persistence

PHASE 03 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✅
Studio Discovery & Management
├── Studio discovery with keyword search
├── Location, price, and equipment filters
├── Provider studio listing CRUD (Create, Edit, Delete)
└── Studio details modal with capacity & gear lists

PHASE 04 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✅
Booking System & Conflict Prevention
├── Interactive date & slot picker
├── Overlapping booking conflict prevention
├── Creator personal booking history & cancellation
└── Provider booking request actions (Confirm, Reject, Complete)

PHASE 05 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 🚧
Backend API Implementation
├── Express REST API routes & controllers
├── JWT authentication & authorization middleware
├── Input validation schemas
└── Prisma database service layer

PHASE 06 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 🚧
Frontend-Backend Integration
├── Switch VITE_USE_API to live backend mode
├── API error handling & network status alerts
└── End-to-end booking transactions

PHASE 07 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 🔜
Testing & Final Deployment
├── Full integration testing
├── Production build verification
└── Project presentation and review
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
