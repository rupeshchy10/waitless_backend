# WaitLess

> Smart Queue & Appointment Optimization System

WaitLess is a real-time backend-focused appointment and queue management system designed to optimize customer flow, reduce waiting times, and improve service efficiency through dynamic queue handling and wait-time prediction.

The system supports appointment booking, priority-based queue management, live queue tracking, dynamic delay handling, and real-time updates.

---

# 🚀 Features

## 1. 🔐 Authentication & Authorization
- JWT Authentication
- Access & Refresh Tokens
- Role-Based Access Control (RBAC)
- Secure Password Hashing with bcrypt

### Roles
- USER
- STAFF
- ADMIN

---

## 2. 📅 Appointment Management
- Book appointments
- Cancel appointments
- Reschedule appointments
- View appointment history
- Service-based booking system

---

## 3. ⏳ Dynamic Queue System
- Real-time queue management
- FIFO queue handling
- Token generation system
- Queue position tracking
- Automatic queue progression

---

## 4. 🚨 Priority Queue Handling
Supports multiple queue priorities:
- Emergency
- VIP
- Normal

Priority requests are processed intelligently to optimize service flow.

---

## 5. ⏱️ Wait-Time Prediction
WaitLess estimates customer waiting time dynamically using:
- Average service duration
- Number of users ahead
- Delay factors
- Queue load

Example Logic:

Estimated Wait Time =
(People Ahead × Average Service Time) + Delay Factor

---

## 6. 🔄 Smart Delay Handling
The system dynamically recalculates queue timings when:
- Service delays occur
- Staff becomes unavailable
- Appointments are paused
- Queue load increases

---

## 7. 📡 Real-Time Updates
- Live queue updates using Socket.io
- Real-time token tracking
- Live wait-time updates
- Instant queue position updates

---

## 8. 🚫 No-Show Handling
If a user does not respond within the allowed time:
- Appointment is skipped automatically
- Queue moves to next user
- Queue timings update dynamically

---

## 9. 🔔 Notification System
Users receive notifications for:
- Appointment reminders
- Queue turn alerts
- Delay notifications
- Queue status updates

---

## 10. 📊 Analytics Dashboard
Admins can monitor:
- Peak service hours
- Average wait times
- Queue load
- Cancellation rates
- Service efficiency metrics

---

# 🛠️ Tech Stack

## Backend
- Node.js
- Express.js

## Database
- PostgreSQL
- Prisma ORM

## Authentication
- JWT
- bcryptjs

## Real-Time & Performance
- Redis
- Socket.io

## API Documentation
- Swagger

---

# 🧠 Backend Concepts Demonstrated

- Queue Data Structures
- Priority Queue Logic
- Real-Time Systems
- System Design
- Scheduling Logic
- Redis Caching
- Role-Based Architecture
- Background Job Processing
- RESTful API Design
- Scalable Backend Architecture

---

# 🗄️ Database Models

Main entities:
- Users
- Appointments
- Queues
- QueueEntries
- ServiceDesks
- Notifications
- AnalyticsLogs

---

# 🔥 Core Workflow

1. User books appointment
2. System generates token
3. User enters queue
4. Queue updates in real time
5. Wait time is estimated dynamically
6. Priority requests handled intelligently
7. Queue automatically progresses
8. Notifications sent to users

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/rupeshchy10/waitless_backend.git
```

---

## Install Dependencies

```bash
npm install
```

---

## Setup Environment Variables

Create a `.env` file:

```env
PORT=8000

DATABASE_URL=

ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=

ACCESS_TOKEN_EXPIRY=
REFRESH_TOKEN_EXPIRY=

REDIS_URL=
```

---

## Run Prisma Migration

```bash
npx prisma migrate dev
```

---

## Start Development Server

```bash
npm run dev
```

---

# 📘 API Documentation

Swagger documentation available at:

```bash
/api-docs
```

---

# 🚀 Future Improvements

- AI-based queue prediction
- SMS notifications
- Mobile application
- Multi-branch support
- Advanced analytics dashboard
- QR-based check-in system

---

# 🎯 Project Goal

The goal of WaitLess is to simulate a production-level queue optimization backend system that demonstrates:
- real-world backend architecture
- queue management algorithms
- real-time communication
- scalable system design

---

# 👨‍💻 Author

Rupesh Choudhary  
Computer Engineering Student — Backend Developer

- 💼 Portfolio: *https://portfolio-using-react-and-tailwind-seven.vercel.app/*
- 🐙 GitHub: *https://github.com/rupeshchy10*