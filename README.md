# WaitLess

> A backend for managing walk-in service queues — join remotely, track your position, get notified when it's your turn.

WaitLess replaces the physical "take a number" system with an API-driven queue: users join a service center's queue, staff call the next person, priority (VIP/Emergency) is handled automatically, and everyone gets notified along the way.

This is a **walk-in token queue** system — you join a live queue and wait your turn. It is not an appointment/booking system (no future-dated scheduling) — see [Future Improvements](#-future-improvements).

---

---

## 🚀 Features

### 1. 🔐 Authentication & Authorization

- JWT authentication via an HttpOnly cookie
- Role-based access control: `USER`, `STAFF`, `ADMIN`
- Passwords hashed with bcrypt
- **Admin-controlled account creation** — self-registration always creates a `USER`; an authenticated `ADMIN` calling the same registration endpoint can create `STAFF`/`ADMIN` accounts directly
- **First-admin seed script** (`npm run seed:admin`) — no manual database editing required to bootstrap the system
- **Forgot/reset password via emailed OTP** — 6-digit code, 10-minute expiry, single-use

---

### 2. ⏳ Queue Management

- Join a service center's queue and get a sequential token number
- Queue entries auto-expire at the service center's closing time, enforced by a scheduled job (`node-cron`)
- Check-in flow before being called
- Queue position + estimated wait time lookup
- Staff actions: call next, complete, mark no-show, cancel, override priority
- Manual end-of-day "close" action (staff/admin-triggered) that expires waiting entries and flags any in-progress entry as no-show
- **Race-condition-safe token assignment** — two simultaneous joins can never collide on the same token number, and neither request fails; the losing request transparently retries onto the next number

---

### 3. 🚨 Priority Queue

Three levels — `NORMAL`, `VIP`, `EMERGENCY` — factored into call order (priority first, then token number).

---

### 4. ⏱️ Wait-Time Estimation

`estimatedWaitMinutes = peopleAhead × averageServiceTime`, using each service center's configured average service time.

---

### 5. 🏢 Service Center Management

- Register, update, and list service centers, each with its own opening/closing hours and average service time
- **Counter-capped staff assignment** — a `counterNumber` field limits how many staff can be assigned to a center, matching its physical counter count
- **Weekly off-days** — service centers can configure recurring closed days (e.g. every Saturday); joining and the live display both respect this

---

### 6. 👥 Staff Assignment

Assign `STAFF`-role users to specific service centers; staff can only act on centers they're assigned to (admins can act on any center).

---

### 7. 🔔 Notifications

Persistent, per-user notification records for queue events (joined, checked in, priority changed, called, no-show, etc.) — read/unread, mark-all-read, delete.

---

### 8. 📊 Queue Statistics

Per-service-center breakdown of queue counts by status (waiting, serving, completed, cancelled, expired, no-show).

---

### 9. 🖼️ Media

Profile pictures (all roles) and service center logos, uploaded via Multer and hosted on Cloudinary — old images are automatically cleaned up on replace or delete.

---

### 10. 🇳🇵 Nepal Time Formatting

Timestamps are additionally returned pre-formatted in Asia/Kathmandu time alongside the raw ISO values.

---

---

## 🛠️ Tech Stack

| Layer        | Choice                      |
| ------------ | --------------------------- |
| Runtime      | Node.js (ESM)               |
| Framework    | Express                     |
| Database     | PostgreSQL                  |
| ORM          | Prisma                      |
| Auth         | JWT (jsonwebtoken) + bcrypt |
| File Storage | Cloudinary (via Multer)     |
| Email        | Nodemailer                  |
| Scheduling   | node-cron                   |
| API Docs     | Scalar (OpenAPI 3.0)        |

---

---

## 🧠 Backend Concepts Demonstrated

- Layered architecture: routes → controllers → services → Prisma
- Role-based authorization scoped to resource ownership (a STAFF user can only act on their assigned service center, not just "any STAFF")
- Consistent response/error envelope (`ApiResponse` / `ApiError`) across every endpoint
- Request validation layer, centralized error middleware, graceful shutdown
- Concurrency handling: retry-on-conflict for high-frequency writes (queue joins), serializable transactions for low-frequency writes where correctness matters more than throughput (staff assignment)
- Security-conscious auth flows: generic responses to prevent account enumeration, single-use expiring OTPs, authorization decisions kept in the layer that has the context to make them
- OpenAPI-documented REST API

---

---

## 🗄️ Database Models

| Model             | Purpose                                                                       |
| ----------------- | ----------------------------------------------------------------------------- |
| `User`            | Account, role (`USER` / `STAFF` / `ADMIN`), profile image, password-reset OTP |
| `ServiceCenter`   | A place with a queue: hours, average service time, counter count, off-days    |
| `Queue`           | One token/turn: status, priority, timestamps                                  |
| `StaffAssignment` | Which staff member is assigned to which center                                |
| `Notification`    | Per-user notification records                                                 |

---

---

## 🔥 Core Workflow

1. User registers/logs in → receives a JWT auth cookie
2. User joins a service center's queue → gets a token number and estimated wait (blocked if today is a configured off-day, or past closing time)
3. User checks in when they arrive
4. Staff calls the next checked-in, highest-priority customer
5. Staff completes the service, marks a no-show, or the user cancels
6. Notifications are created at every step along the way

---

---

## ⚙️ Installation

### Clone the repository

```bash
git clone https://github.com/rupeshchy10/waitless_backend.git
cd waitless_backend
```

---

### Install dependencies

```bash
npm install
```

---

### Set up environment variables

Create a `.env` file:

```env
NODE_ENV=development
PORT=8000

DATABASE_URL=

JWT_SECRET=
JWT_EXPIRES_IN=7d

# Cloudinary — profile pictures & service center logos
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email (SMTP) — forgot-password OTP delivery
EMAIL_HOST=
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=

# First admin account — created once via `npm run seed:admin`
SEED_ADMIN_FULLNAME=
SEED_ADMIN_EMAIL=
SEED_ADMIN_PASSWORD=
SEED_ADMIN_PHONE=
SEED_ADMIN_ADDRESS=
```

---

### Run Prisma migrations

```bash
npx prisma migrate dev
```

---

### Seed the first admin account

```bash
npm run seed:admin
```

Every subsequent `STAFF`/`ADMIN` account is created by an already-authenticated admin through the normal registration endpoint — this script only exists to bootstrap the very first one.

---

### Start the development server

```bash
npm run dev
```

---

The API runs at `http://localhost:8000/api/v1`, with interactive docs at `http://localhost:8000/api/v1/reference`.

---

---

## 📘 API Documentation

Interactive API reference at `/api/v1/reference`, powered by [Scalar](https://scalar.com/) and generated live from `src/docs/openapi.yaml`. It's live demo on Render - [click here](https://waitless-backend-using-pern.onrender.com/api/v1/reference#description/introduction)

---

---

## 🎯 Project Goal

WaitLess is a portfolio backend built to demonstrate solid REST API fundamentals — layered architecture, role-scoped authorization, clean data modeling, and documented endpoints — on top of a genuinely useful problem: getting rid of physical waiting lines.

---

---

## 🚀 Future Improvements

Deliberately out of scope for this version:

- **Real-time updates (Socket.io) + Redis caching** — explored and prototyped during development, then intentionally reverted to keep the project scope manageable for the timeline. A candidate for a future iteration, not abandoned for technical reasons.
- **Appointment-based booking system (scheduled visits)** — a genuinely different model from the current walk-in queue; would need its own design pass rather than being bolted onto this system.
- **Daily queue capacity limit per service center** — considered and rejected; a fixed cap risks turning users away on a day that would've finished early, which is worse than the problem it solves. Off-day/closing-time checks already handle the actual concern.
- SMS notification integration
- Multi-branch analytics dashboard
- QR code-based check-in system

---

---

# 👨‍💻 Author

**Rupesh Choudhary**  
Computer Engineering Student — Backend Developer

- 💼 Portfolio: *https://portfolio-using-react-and-tailwind-seven.vercel.app/*
- 🐙 GitHub: *https://github.com/rupeshchy10*
