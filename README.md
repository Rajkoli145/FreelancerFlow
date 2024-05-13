# FreelancerFlow

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License">
  <img src="https://img.shields.io/github/actions/workflow/status/Rajkoli145/FreelancerFlow/test.yml?label=CI&logo=github-actions" alt="CI Status">
  <img src="https://img.shields.io/badge/node-%3E%3D20.x-brightgreen" alt="Node Version">
  <img src="https://img.shields.io/badge/coverage-50%25+-brightgreen" alt="Coverage">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
</p>

<p align="center">
  <strong>A full-stack MERN application for freelancers to manage clients, projects, time, invoices, payments, and expenses — in one place.</strong>
</p>

<p align="center">
  <a href="https://freelancer-flow-seven.vercel.app">
    <img src="https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=vercel" alt="Live Demo">
  </a>
</p>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [API Overview](#api-overview)
- [Docker](#docker)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Overview

FreelancerFlow helps independent freelancers run their business end-to-end. Track billable hours, issue PDF invoices, record payments, monitor expenses, and get earnings reports — all from a single dashboard.

The backend is a REST API built with Express and MongoDB. The frontend is a React SPA with Tailwind CSS served independently (Vite dev server locally, Vercel in production).

---

## Features

| Area | Capabilities |
|------|-------------|
| **Authentication** | Email/password signup & login, JWT sessions, Google & GitHub OAuth via Firebase |
| **Clients** | Full CRUD, billing address, per-client stats |
| **Projects** | Hourly and fixed-price billing, status tracking |
| **Time Logging** | Log billable and non-billable hours per project |
| **Invoices** | Generate PDF invoices, line items, tax, discounts |
| **Payments** | Record payments against invoices, track outstanding balances |
| **Expenses** | Categorised expense tracking linked to projects |
| **Reports** | Revenue, expenses, profitability, and time reports |
| **Notifications** | In-app notifications system |
| **Admin** | Admin-only dashboard with system metrics |

---

## Tech Stack

### Backend
| Package | Purpose |
|---------|---------|
| Node.js 20.x + Express 5 | HTTP server and routing |
| MongoDB 6 + Mongoose | Database and ODM |
| JSON Web Token | Stateless authentication |
| Bcryptjs | Password hashing |
| Joi | Request body validation |
| Helmet | Secure HTTP headers |
| express-rate-limit | Rate limiting |
| express-mongo-sanitize | NoSQL injection protection |
| xss-clean + hpp | XSS and HTTP pollution protection |
| Winston | Structured logging with daily log rotation |
| PDFKit | PDF invoice generation |
| Swagger / OpenAPI | Interactive API documentation |
| Jest + Supertest | Testing framework |
| mongodb-memory-server | In-memory database for tests |

### Frontend
| Package | Purpose |
|---------|---------|
| React 19 + Vite | UI framework and build tool |
| Tailwind CSS 3 | Utility-first CSS |
| React Router 7 | Client-side routing |
| Axios | HTTP client with interceptors |
| Recharts | Data visualisation charts |
| Lucide React | Icon library |
| Firebase SDK | Google/GitHub OAuth |
| Vitest + React Testing Library | Testing framework |

---

## Architecture

```
FreelancerFlow/
├── backend/                    # Node.js + Express REST API
│   ├── src/
│   │   ├── config/            # DB connection, Firebase, Swagger, app config
│   │   ├── controllers/       # Route handlers (one file per resource)
│   │   ├── middleware/        # auth, validation, error handling
│   │   ├── models/            # Mongoose schemas
│   │   ├── routes/            # Express routers
│   │   ├── utils/             # Logger, error classes, PDF, invoice helpers
│   │   └── __tests__/         # Jest + Supertest integration & unit tests
│   │       └── setup/         # In-memory MongoDB test setup
│   ├── jest.config.json
│   ├── .env.example
│   └── package.json
│
├── frontend/                   # React SPA (Vite)
│   ├── src/
│   │   ├── api/               # Axios instances and API call modules
│   │   ├── components/        # Reusable UI components (Button, Input, etc.)
│   │   ├── context/           # AuthContext (global auth state)
│   │   ├── hooks/             # Custom hooks (useAuth)
│   │   ├── layouts/           # AppLayout, AdminLayout
│   │   ├── pages/             # Route-level page components
│   │   ├── routes/            # ProtectedRoute, AdminRoute
│   │   ├── styles/            # Global CSS
│   │   └── __tests__/         # Vitest + React Testing Library tests
│   ├── vite.config.js
│   └── package.json
│
├── .github/
│   └── workflows/
│       ├── test.yml           # Unified CI: backend + frontend tests
│       └── backend-ci.yml     # Legacy backend-only CI (kept for reference)
│
└── Dockerfile                 # Production Docker image (node:20.11.1-slim)
```

### Request Flow

```
Client → React SPA (Vite / Vercel)
            │
            │  HTTPS REST calls
            ▼
        Express API (Node.js)
            │
            ├── Helmet / CORS / Rate Limiter
            ├── Body parsing + Data sanitization (mongo-sanitize, xss, hpp)
            ├── JWT auth middleware (protect)
            ├── Joi validation middleware (validate)
            ├── Route handler (catchAsync wrapper)
            └── MongoDB (Mongoose)
```

---

## Quick Start

### Prerequisites

- Node.js >= 20.x
- MongoDB >= 6.0 (local) or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster
- npm >= 9.x

### 1. Clone the repository

```bash
git clone https://github.com/Rajkoli145/FreelancerFlow.git
cd FreelancerFlow
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

Backend runs at: `http://localhost:5000`
Swagger UI: `http://localhost:5000/api-docs`

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in the required values.

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `development` \| `production` \| `test` |
| `PORT` | Yes | Server port (default: `5000`) |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret key ≥ 32 chars — generate with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `JWT_EXPIRE` | Yes | Token expiry (e.g., `7d`) |
| `FRONTEND_URL` | Yes | CORS origin for the frontend |
| `FIREBASE_PROJECT_ID` | No | Firebase project ID (OAuth) |
| `FIREBASE_CLIENT_EMAIL` | No | Firebase service account email |
| `FIREBASE_PRIVATE_KEY` | No | Firebase service account private key |

> **Note:** Never commit real `.env` files. The `backend/.env.example` is the only environment file that should be committed.

---

### Running Tests (Root)

You can run both backend and frontend tests simultaneously from the root directory:

```bash
# Run all tests
npm test

# Run all tests with coverage
npm run test:coverage
```

### Backend (Jest + Supertest)

Tests run against an in-memory MongoDB instance — no external database required.

```bash
cd backend

# Run all tests with coverage report
npm test

# Run in watch mode (during development)
npm run test:watch

# CI mode (no watch, --runInBand for sequential execution)
npm run test:ci

# View coverage report
open coverage/index.html
```

**Test files:**

| File | What it tests |
|------|--------------|
| `auth.test.js` | Signup, login, `/me`, profile update, password change |
| `clients.test.js` | Full client CRUD, auth enforcement, cross-user isolation |
| `projects.test.js` | Full project CRUD, billing type validation, isolation |
| `health.test.js` | Health endpoints, 404 handler |
| `middleware.test.js` | `validate()`, `validateObjectId()` unit tests |

### Frontend (Vitest + React Testing Library)

```bash
cd frontend

# Run all tests once
npm test

# Run in watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage
```

**Test files:**

| File | What it tests |
|------|--------------|
| `LoginPage.test.jsx` | Form rendering, validation, API calls, navigation, error UI |
| `AuthContext.test.jsx` | Session restore, login/logout state, token management |
| `ProtectedRoute.test.jsx` | Auth redirect, loading state, content rendering |
| `Button.test.jsx` | Click handling, loading/disabled states, type attribute |
| `Input.test.jsx` | Label, error display, helper text, password toggle |

---

## API Overview

Base URL: `http://localhost:5000/api`
Interactive docs: `http://localhost:5000/api-docs` (Swagger UI)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/signup` | Create a new account | No |
| POST | `/auth/login` | Login and receive a JWT | No |
| GET | `/auth/me` | Get current user profile | Yes |
| PUT | `/auth/profile` | Update profile | Yes |
| PUT | `/auth/password` | Change password | Yes |
| GET | `/client` | List all clients | Yes |
| POST | `/client` | Create a client | Yes |
| GET | `/client/:id` | Get client by ID | Yes |
| PUT | `/client/:id` | Update client | Yes |
| DELETE | `/client/:id` | Delete client | Yes |
| GET | `/project` | List all projects | Yes |
| POST | `/project` | Create a project | Yes |
| GET | `/project/:id` | Get project by ID | Yes |
| PUT | `/project/:id` | Update project | Yes |
| DELETE | `/project/:id` | Delete project | Yes |
| GET | `/invoice` | List invoices | Yes |
| POST | `/invoice` | Create invoice | Yes |
| GET | `/invoice/:id/pdf` | Download PDF invoice | Yes |
| GET | `/dashboard` | Dashboard summary stats | Yes |
| GET | `/report/summary` | Financial report | Yes |
| GET | `/health` | Health check | No |

All protected endpoints require an `Authorization: Bearer <token>` header.

---

## Docker

Build and run the backend in a container:

```bash
# Build the image
docker build -t freelancerflow .

# Run with environment variables
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e MONGO_URI=mongodb+srv://... \
  -e JWT_SECRET=your-secret \
  freelancerflow
```

The Dockerfile:
- Uses `node:20.11.1-slim` (pinned, minimal attack surface)
- Sets `NODE_ENV=production`
- Installs only production dependencies (`--omit=dev`)
- Runs as a non-root user (`nodeuser`) for security

---

## Deployment

The frontend is deployed to [Vercel](https://vercel.com) via the `vercel.json` config in `frontend/`. The backend can be deployed to any Node.js-compatible platform.

See [backend/DEPLOYMENT.md](backend/DEPLOYMENT.md) for detailed instructions covering Heroku, Railway, AWS, and Docker.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Write tests for your changes
4. Ensure all tests pass:
   ```bash
   cd backend && npm test
   cd frontend && npm test
   ```
5. Commit with a descriptive message following [Conventional Commits](https://www.conventionalcommits.org/)
6. Open a pull request against `main`

---

## Author

**Raj Koli**
- GitHub: [@Rajkoli145](https://github.com/Rajkoli145)

---

## License

MIT — see [LICENSE](LICENSE) for details.
