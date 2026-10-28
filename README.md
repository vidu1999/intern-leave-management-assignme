# LeaveManager — Employee Leave Management System

A full-stack Employee Leave Management System built for the **Omibits (Pvt) Ltd. Software
Engineering Intern technical assignment**. It is a working application — React dashboard,
Express REST API, SQLite database — not a mock-up.

![Dashboard](docs/screenshots/01-dashboard.png)

> **Quick start (one command):** `npm run setup` installs both halves, creates the `.env` files,
> migrates the database and loads the demo data; `npm run dev` then starts the API **and** the web
> app together. Open <http://localhost:5173>. Prefer separate terminals? See
> [section 11](#11-running-the-application).
> On Windows use `Copy-Item .env.example .env`. Full details in [section 8](#8-installation-on-windows-11).

---

## Table of contents

1. [Assignment overview](#1-assignment-overview)
2. [Features](#2-features)
3. [Technology stack](#3-technology-stack)
4. [Screenshots](#4-screenshots)
5. [Architecture overview](#5-architecture-overview)
6. [Database schema and relationships](#6-database-schema-and-relationships)
7. [Prerequisites](#7-prerequisites)
8. [Installation on Windows 11](#8-installation-on-windows-11)
9. [Environment variables](#9-environment-variables)
10. [Database migration and optional seed](#10-database-migration-and-optional-seed)
11. [Running the application](#11-running-the-application)
12. [Testing](#12-testing)
13. [API documentation](#13-api-documentation)
14. [Business rules enforced by the backend](#14-business-rules-enforced-by-the-backend)
15. [Design decisions and challenges](#15-design-decisions-and-challenges)
16. [Known limitations](#16-known-limitations)
17. [Authentication and authorization](#17-authentication-and-authorization)
18. [Future improvements](#18-future-improvements)
19. [Project structure](#19-project-structure)
20. [Deployment — running it globally](#20-deployment--running-it-globally)
21. [Troubleshooting](#21-troubleshooting)

---

## 1. Assignment overview

Omibits (Pvt) Ltd. HR currently tracks employee leave manually. This project delivers a small
but complete internal tool that lets HR:

* maintain an employee directory,
* accept leave requests from employees,
* approve or reject those requests with an auditable decision,
* see live statistics about leave usage.

Everything the UI displays is read from and written to a real SQLite database through an
Express REST API. There is no fabricated dashboard data, no client-only state pretending to be
persistence, and no fake login screen.

---

## 2. Features

### Dashboard (`/`)
* Four KPI cards — Total Employees, Total Leave Requests, Pending Requests, Approved Requests —
  computed with SQL aggregate queries.
* "Recent Leave Requests" table (latest five, status badges, "View all" link).
* "Leave Requests by Type" donut chart (Annual / Casual / Medical) built with Recharts from real
  counts, with a proper empty state when the database has no requests.
* Sidebar live counters for pending work.

### Employees (`/employees`)
* Server-side search (name, email, department) with debounce.
* Add employee (modal form) and edit employee, both persisted through the API.
* Delete employee with confirmation — **blocked** when the employee owns leave requests.
* Field-level validation (required name, valid unique email, department from a fixed list),
  duplicate-email errors surfaced from the API.
* Loading skeletons, empty state, error state with retry.

### Submit Leave Request (`/leaves/new`)
* Two-column layout: form on the left, "Leave Types" and "Important" guidance cards on the right.
* Employee dropdown loaded from the API, leave type, start/end date, reason with live counter.
* Client-side validation plus the same rules re-checked on the backend.
* Duplicate submission prevention (button disabled and guarded while the request is in flight).
* Success toast, then the form resets; status is always set to `Pending` by the server.

### Leave Requests (`/leaves`)
* Full table: Request ID, Employee, Leave Type, Start/End Date, Reason, Status, Actions.
* Search by employee name **or** reason, filter by leave type, filter by status, clear filters.
* Server-side pagination with a result range footer.
* Approve (confirmation dialog) and Reject (modal that requires a reason) for pending requests.
* Rejection reason is stored and displayed; processed rows no longer offer Approve/Reject.
* Detail view for every request (keyboard accessible dialog).

### Manage Leaves (`/admin/leaves`)
* Administrator-oriented queue reusing the same API and table components.
* Status tabs (All / Pending / Approved / Rejected) with live counts.
* Search, leave-type filter, pagination, request detail view and the same approval workflow.

### Reports (`/reports`)
* Totals: employees, requests, pending, approved, rejected.
* Requests grouped by status (percentage bars) and by leave type (Recharts bar chart).
* Recent requests summary table.
* Empty states for every panel when there is no data.

### Cross-cutting UX
* Responsive from 375 px to 1440 px+ (drawer navigation on mobile, sticky action column inside
  scrollable tables, cards that reflow).
* Reusable components: Button, Input, Select, Textarea, Modal, ConfirmDialog, Toast, Badge,
  Pagination, EmptyState, ErrorMessage, LoadingSpinner, LeaveStatusBadge, tables, forms.
* Reusable toast system (no `alert()`), accessible labels, `aria-invalid`, `aria-describedby`,
  focus trapping in dialogs, Escape to close, skip-to-content link.

---

## 3. Technology stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Vite 6, JavaScript (JSX), Tailwind CSS 3, React Router 6, Lucide React, Axios, Recharts |
| Backend | Node.js 20+, Express 4, REST API, `morgan` (request logging), `cors`, `dotenv` |
| Database | SQLite (via `better-sqlite3`), versioned SQL migrations |
| Backend tests | Jest + Supertest (in-memory SQLite per suite) |
| Frontend tests | Vitest + React Testing Library + jest-dom + user-event (jsdom) |
| Tooling | ESLint, npm, Git, `.env` / `.env.example` |
| Deployment | Single Node service (Express serves the built SPA), Docker image, Render Blueprint — see [Deployment](#20-deployment--running-it-globally) |

### A note on Prisma

The assignment suggested Prisma for SQLite. In this environment the Prisma CLI requires
downloading engine binaries from `binaries.prisma.sh`, which is unreachable (the current Prisma
release line, 8.x, also replaced the classic `generate`/`migrate` workflow). Rather than ship a
project that cannot be installed, the data layer uses **`better-sqlite3` with hand-written,
versioned SQL migrations** and a small repository layer (`server/src/data/*.js`) that mirrors what
Prisma would generate. The architecture is unchanged: services never build SQL strings, all
queries are prepared statements with bound parameters, and the schema is created by a reproducible
migration runner (`npm run db:migrate`). See
[Design decisions and challenges](#15-design-decisions-and-challenges).

---

## 4. Screenshots

All screenshots below were captured from the running application (`docs/screenshots/`) with a
headless Chromium instance driving the real UI: the employee in `03`/`04` was created through the
API, the request in `04b` was submitted through the form, and `07`/`08` are the result of clicking
Approve and Reject in the table. The data shown comes from the optional development seed script
plus those interactions; it is demonstration data, not real company records. `16`/`17` were
captured against an empty database to prove the empty states.

| Screen | Screenshot |
| --- | --- |
| Dashboard | ![Dashboard](docs/screenshots/01-dashboard.png) |
| Employees list | ![Employees](docs/screenshots/02-employees.png) |
| Add employee form | ![Add employee](docs/screenshots/03-add-employee-form.png) |
| Submit leave request | ![Submit leave request](docs/screenshots/04-submit-leave-request.png) |
| Leave request created (toast + reset form) | ![Request created](docs/screenshots/04b-leave-request-submitted.png) |
| Leave requests table | ![Leave requests](docs/screenshots/05-leave-requests.png) |
| Reject request modal | ![Reject modal](docs/screenshots/06-reject-request-modal.png) |
| Approved request state | ![Approved](docs/screenshots/07-approved-request.png) |
| Rejected request state | ![Rejected](docs/screenshots/08-rejected-request.png) |
| Manage Leaves (admin) | ![Manage leaves](docs/screenshots/09-manage-leaves.png) |
| Reports | ![Reports](docs/screenshots/10-reports.png) |
| Mobile dashboard (375 px) | ![Mobile dashboard](docs/screenshots/11-mobile-dashboard.png) |
| Mobile navigation drawer | ![Mobile navigation](docs/screenshots/12-mobile-navigation.png) |
| Mobile leave requests | ![Mobile leave requests](docs/screenshots/13-mobile-leave-requests.png) |
| Tablet leave requests (768 px) | ![Tablet](docs/screenshots/14-tablet-leave-requests.png) |
| Laptop leave requests (1024 px) | ![Laptop](docs/screenshots/15-laptop-leave-requests-1024.png) |
| Empty-state dashboard (no data) | ![Empty dashboard](docs/screenshots/16-empty-state-dashboard.png) |
| Empty-state employee directory | ![Empty employees](docs/screenshots/17-empty-state-employees.png) |

---

## 5. Architecture overview

```
┌────────────────────────────┐        HTTP/JSON        ┌────────────────────────────┐
│  React SPA (Vite, :5173)   │  ───────────────────►   │  Express API (:5000)       │
│                            │      Axios /api/*       │                            │
│  pages → components        │                         │  routes → controllers      │
│  services (Axios client)   │  ◄───────────────────   │        → services          │
│  hooks (data + UI state)   │      JSON responses     │        → data repositories │
└────────────────────────────┘                         │  validators, ApiError      │
                                                       └─────────────┬──────────────┘
                                                                     │ prepared SQL
                                                       ┌─────────────▼──────────────┐
                                                       │  SQLite  server/data/*.db  │
                                                       └────────────────────────────┘
```

**Request flow (example: approving a request)**

1. `LeaveRequestsPage` calls `approveLeaveRequest(id)` in `client/src/services/leaveService.js`.
2. Axios (single instance in `client/src/services/api.js`) sends `PATCH /api/leaves/:id/approve`.
3. `leaveRoutes` → `leaveController.approve` → `leaveService.approveLeaveRequest`.
4. The service validates the id, loads the request, then performs the conditional update
   `UPDATE leave_requests SET status='Approved' WHERE id=? AND status='Pending'`.
5. If zero rows changed, the transition is invalid for the current status → `409 Conflict`.
6. The controller returns `{ success: true, data: {...} }`; the page refreshes the table and the
   shared summary so the dashboard counters change immediately.

**Backend layering**

| Folder | Responsibility |
| --- | --- |
| `server/src/routes` | Express routers, wiring only |
| `server/src/controllers` | HTTP concerns: status codes, response envelope |
| `server/src/services` | Business rules and status transitions |
| `server/src/data` | Prepared SQL statements and row → API mapping |
| `server/src/validators` | Payload and query validation with field-level messages |
| `server/src/middleware` | `errorHandler`, `notFound` (CORS/JSON configured in `app.js`) |
| `server/src/utils` | `ApiError`, `asyncHandler`, date helpers |

**Frontend layering**

| Folder | Responsibility |
| --- | --- |
| `client/src/pages` | One component per route |
| `client/src/components` | Reusable UI grouped by feature (`layout`, `dashboard`, `employees`, `leaves`, `common`) |
| `client/src/hooks` | Data loading (`useEmployees`, `useLeaveRequests`), shared summary, toasts, debounce, Escape key |
| `client/src/services` | Axios instance and one module per API resource |
| `client/src/utils` | Formatting, validation (mirrors backend rules), constants |
| `client/src/test` | Vitest setup |

---

## 6. Database schema and relationships

```
employees 1 ─────< leave_requests
             (leave_requests.employee_id → employees.id, ON DELETE RESTRICT)
```

### `employees`

| Column | Type | Constraints |
| --- | --- | --- |
| `id` | INTEGER | Primary key, autoincrement |
| `name` | TEXT | NOT NULL, non-empty |
| `email` | TEXT | NOT NULL, UNIQUE (case-insensitive), non-empty |
| `department` | TEXT | NOT NULL, non-empty |
| `created_at` | TEXT (ISO-8601) | NOT NULL |
| `updated_at` | TEXT (ISO-8601) | NOT NULL |

### `leave_requests`

| Column | Type | Constraints |
| --- | --- | --- |
| `id` | INTEGER | Primary key, autoincrement |
| `employee_id` | INTEGER | NOT NULL, FK → `employees.id`, `ON DELETE RESTRICT` |
| `leave_type` | TEXT | NOT NULL, `CHECK IN ('Annual','Casual','Medical')` |
| `start_date` | TEXT | NOT NULL, `YYYY-MM-DD` format check |
| `end_date` | TEXT | NOT NULL, `YYYY-MM-DD` format check, `>= start_date` |
| `reason` | TEXT | NOT NULL, non-empty |
| `status` | TEXT | NOT NULL, default `'Pending'`, `CHECK IN ('Pending','Approved','Rejected')` |
| `rejection_reason` | TEXT | NULL unless status is `Rejected` (enforced by a CHECK) |
| `created_at` | TEXT (ISO-8601) | NOT NULL |
| `updated_at` | TEXT (ISO-8601) | NOT NULL |

Indexes: `employee_id`, `status`, `created_at DESC`, `employees.name COLLATE NOCASE`.

The schema lives in `server/db/migrations/001_init.sql` and is applied by
`server/db/migrate.js`, which records each applied file in a `_migrations` table so re-running is
idempotent. Foreign keys are enabled per connection (`PRAGMA foreign_keys = ON`) and WAL mode is
used for better read concurrency.

---

## 7. Prerequisites

* **Node.js 20 LTS or newer** (developed and tested on Node 22.22.3) and the bundled npm 10.
* **Git**.
* Windows 11 (commands below), macOS or Linux work the same way.
* No Docker, Redis, cloud account or paid API is required. The database is a local file.

```powershell
node --version   # v20.x or newer
npm --version
```

> `better-sqlite3` is a native module. It ships prebuilt binaries for common Node versions on
> Windows; if npm has to compile it, install the "Desktop development with C++" workload from
> Visual Studio Build Tools first.

---

## 8. Installation on Windows 11

Open **PowerShell** in the folder where you want the project.

```powershell
git clone <repository-url> intern-leave-management-assignme
cd intern-leave-management-assignme
npm run setup
```

`npm run setup` (plain Node, no extra dependencies) runs these steps for you:

1. `npm install` in `server/` (this is where `better-sqlite3` compiles on first run)
2. `npm install` in `client/`
3. copies `server/.env.example` → `server/.env` and `client/.env.example` → `client/.env`
   **only if the file does not exist yet**, so your local settings are never overwritten
4. applies the SQL migration that creates `server/data/leave_manager.db`
5. loads the demonstration data (skips automatically when the database already has employees)

It is safe to re-run. Then start everything with `npm run dev` ([section 11](#11-running-the-application)).

<details>
<summary>Manual steps, if you prefer to run them yourself</summary>

```powershell
cd server
npm install
Copy-Item .env.example .env
npm run db:migrate
npm run db:seed          # optional demonstration data
cd ..

cd client
npm install
Copy-Item .env.example .env
cd ..
```

`cmd.exe` users can run the same steps with `copy .env.example .env` instead of `Copy-Item`.
From the repository root, `npm run db:migrate` and `npm run db:seed` delegate to `server/`.

</details>

---

## 9. Environment variables

### `server/.env` (template in `server/.env.example`)

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `5000` | HTTP port of the API |
| `NODE_ENV` | `development` | `development` / `production` / `test` |
| `DATABASE_FILE` | `./data/leave_manager.db` | SQLite file, relative to `server/` or absolute |
| `CLIENT_ORIGIN` | `http://localhost:5173,http://127.0.0.1:5173` | Comma separated CORS allow-list |

### `client/.env` (template in `client/.env.example`)

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | *(empty → `/api`)* | Explicit API base URL, e.g. `http://localhost:5000/api`. Empty keeps the Vite proxy |
| `VITE_PROXY_TARGET` | `http://127.0.0.1:5000` | Where the dev server proxies `/api` |

Both `.env` files are git-ignored; only the `.example` files are committed. No real credentials
exist in this project.

---

## 10. Database migration and optional seed

```powershell
cd server
npm run db:migrate            # creates server/data/leave_manager.db and applies pending migrations
npm run db:seed               # inserts demo data only when the database has no employees
npm run db:seed -- --force    # wipes and reloads the demo data set
```

The API also runs pending migrations automatically on start-up, so `npm run db:migrate` is only
strictly required for a first manual setup.

**Demonstration data disclaimer.** The seed script creates six fictional employees on
`@omibits.example` addresses and eight fictional leave requests. It never runs automatically,
the UI does not label them as real, and this README calls them demonstration data. Leave the
step out to start with an empty database — every screen has an empty state.

Database files (`*.db`, `*.db-wal`, `*.db-shm`) are git-ignored so no personal data is committed.

---

## 11. Running the application

### One command (recommended)

```powershell
npm run dev
```

From the repository root this starts **both** processes:

1. the API (`node --watch src/server.js`) on <http://localhost:5000>
2. waits until `GET /api/health` answers *OK*
3. the Vite dev server on <http://localhost:5173>

Stop both with a single `Ctrl+C` — the script kills the whole process group, so port 5000 or 5173
is never left occupied by an orphan. If dependencies or `.env` files are missing it stops
immediately and tells you to run `npm run setup` instead of failing halfway.

Open <http://localhost:5173>. The Vite dev server proxies `/api` to `http://127.0.0.1:5000`, so the
browser only talks to one origin (no CORS surprises, and the same setup works behind a port
forwarding proxy).

> **Why this matters:** the API and the web app are two separate processes. Starting only
> `client/` gives you a working-looking UI whose every request fails with *"The API is not
> reachable"* — the failure this project used to show. `npm run dev` starts them in the right order.
>
> `npm run dev` also reads `PORT` from `server/.env` and points the Vite proxy at that port, so
> changing the API port in one place is enough.

### Two terminals (when you want separate logs)

```powershell
# Terminal 1 - API
npm run dev:server    # node --watch, http://localhost:5000   (or: npm start)

# Terminal 2 - web app
npm run dev:client    # Vite, http://localhost:5173
```

Quick API check:

```powershell
Invoke-RestMethod http://localhost:5000/api/health
Invoke-RestMethod http://localhost:5000/api/reports/summary
```

**Production build**

```powershell
cd client
npm run build        # emits client/dist
npm run preview      # serves the built assets on http://localhost:4173
```

`npm run build` creates `client/dist`. The Express server automatically serves that folder when it
exists, so a production run is a **single process on a single port**:

```powershell
npm run build --prefix client
$env:NODE_ENV="production"; npm start     # http://localhost:5000 serves UI + API
```

See [Deployment](#20-deployment--running-it-globally) for publishing it to a public URL.

---

## 12. Testing

```powershell
# Everything
npm test                      # repository root: backend suite, then frontend suite

# Backend (Jest + Supertest, in-memory SQLite per suite)
cd server
npm test
npm run test:coverage

# Frontend (Vitest + React Testing Library, jsdom)
cd client
npm test
npm run test:watch
```

Last verified results (Node 22.22.3):

| Suite | Command | Result |
| --- | --- | --- |
| Backend | `cd server && npm test` | **39 passed**, 3 suites |
| Frontend | `cd client && npm test` | **37 passed**, 6 files |
| Linting | `cd server && npx eslint .` / `cd client && npx eslint . --ext js,jsx` | **no errors** |
| Production build | `cd client && npm run build` | **success** |

Backend coverage highlights — employee creation, trimming/normalisation, missing name, invalid
email, duplicate email (409), listing and search, 404/400 id validation, update, deletion policy;
leave creation with `Pending` enforced even when the client sends `status`, unknown employee,
unsupported leave type, missing reason, end date before start date, malformed/impossible dates,
single-day requests, filtering/pagination/search, approve, reject with reason, rejection without a
reason, approving an approved request (409), rejecting a rejected request (409), approving a
rejected request (409), 404 for unknown ids, and a concurrent double-approval race.

Frontend coverage highlights — employee form validation and API error display, leave form
validation, invalid date range blocking submission, successful submission payload, backend
validation messages, status badge colours, approve/reject controls only for pending rows, reject
modal content and required reason, focus retention inside the modal, table empty/error states,
the error classifier (4xx envelope, 409, proxy 500/502 page, 404, refused connection, timeout),
and the reject modal keeping API failures out of the reason field's validation message.

Tests never touch `server/data/leave_manager.db`; each backend suite runs against a private
in-memory database created by the real migrations.

---

## 13. API documentation

Base URL: `http://localhost:5000/api`

### Response envelope

Success:

```json
{ "success": true, "data": { }, "message": "optional human readable message" }
```

Error:

```json
{
  "success": false,
  "message": "End date must be on or after the start date.",
  "errors": { "endDate": "End date must be on or after start date." }
}
```

### Status codes

| Code | Meaning |
| --- | --- |
| 200 | Successful retrieval or update |
| 201 | Resource created |
| 400 | Validation error, malformed id, invalid status transition payload |
| 404 | Resource or route not found |
| 409 | Duplicate email, or the request is no longer `Pending` |
| 500 | Unexpected server error (generic message, details only logged server-side) |

### Employees

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/employees?search=kasun` | List employees (sorted by name). Optional search over name/email/department |
| `POST` | `/employees` | Create an employee |
| `GET` | `/employees/:id` | Fetch one employee |
| `PATCH` | `/employees/:id` | Update name / email / department |
| `DELETE` | `/employees/:id` | Delete an employee that has **no** leave requests |

**Create employee**

```powershell
Invoke-RestMethod -Method Post http://localhost:5000/api/employees `
  -ContentType 'application/json' `
  -Body '{"name":"Kasun Perera","email":"kasun@example.com","department":"IT"}'
```

```json
{
  "success": true,
  "message": "Employee created successfully.",
  "data": {
    "id": 7,
    "name": "Kasun Perera",
    "email": "kasun@example.com",
    "department": "IT",
    "createdAt": "2026-10-27T12:03:02.497Z",
    "updatedAt": "2026-10-27T12:03:02.497Z"
  }
}
```

Duplicate email (409):

```json
{
  "success": false,
  "message": "An employee with this email address already exists.",
  "errors": { "email": "An employee with this email address already exists." }
}
```

Deleting an employee who owns leave requests (409):

```json
{
  "success": false,
  "message": "This employee has 2 leave request(s) and cannot be deleted. Delete policy: employees with leave history are retained.",
  "errors": { "employee": "Employees with leave requests cannot be deleted." }
}
```

### Leave requests

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/leaves?page=1&pageSize=8&search=&leaveType=&status=` | Paginated list with employee details |
| `POST` | `/leaves` | Create a request (always stored as `Pending`) |
| `GET` | `/leaves/:id` | Fetch one request |
| `PATCH` | `/leaves/:id/approve` | Approve a pending request |
| `PATCH` | `/leaves/:id/reject` | Reject a pending request (reason required) |

**Create request**

```powershell
Invoke-RestMethod -Method Post http://localhost:5000/api/leaves `
  -ContentType 'application/json' `
  -Body '{"employeeId":1,"leaveType":"Annual","startDate":"2026-11-02","endDate":"2026-11-04","reason":"Family vacation"}'
```

```json
{
  "success": true,
  "message": "Leave request submitted successfully.",
  "data": {
    "id": 9,
    "employeeId": 1,
    "employee": { "id": 1, "name": "Kasun Perera", "email": "kasun@example.com", "department": "IT" },
    "employeeName": "Kasun Perera",
    "leaveType": "Annual",
    "startDate": "2026-11-02",
    "endDate": "2026-11-04",
    "totalDays": 3,
    "reason": "Family vacation",
    "status": "Pending",
    "rejectionReason": null,
    "createdAt": "2026-10-27T12:10:00.000Z",
    "updatedAt": "2026-10-27T12:10:00.000Z"
  }
}
```

**List requests**

```powershell
Invoke-RestMethod 'http://localhost:5000/api/leaves?page=1&pageSize=5&status=Pending&search=kasun'
```

```json
{
  "success": true,
  "data": [ { "id": 9, "status": "Pending", "employee": { "name": "Kasun Perera" } } ],
  "pagination": { "page": 1, "pageSize": 5, "total": 1, "totalPages": 1 }
}
```

**Approve**

```powershell
Invoke-RestMethod -Method Patch http://localhost:5000/api/leaves/9/approve
```

Already processed (409):

```json
{
  "success": false,
  "message": "This leave request has already been approved and cannot be processed again."
}
```

**Reject**

```powershell
Invoke-RestMethod -Method Patch http://localhost:5000/api/leaves/9/reject `
  -ContentType 'application/json' `
  -Body '{"rejectionReason":"Insufficient staffing during the requested period."}'
```

Missing reason (400):

```json
{
  "success": false,
  "message": "A rejection reason is required.",
  "errors": { "rejectionReason": "A rejection reason is required." }
}
```

### Reports and meta

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/reports/summary` | Totals, counts by status, counts by leave type, five most recent requests |
| `GET` | `/meta` | Supported departments, leave types and statuses |
| `GET` | `/health` | Liveness probe |

```json
{
  "success": true,
  "data": {
    "totals": { "employees": 6, "leaveRequests": 8, "pending": 4, "approved": 3, "rejected": 1 },
    "byStatus": [ { "status": "Pending", "count": 4 }, { "status": "Approved", "count": 3 }, { "status": "Rejected", "count": 1 } ],
    "byLeaveType": [ { "leaveType": "Annual", "count": 3 }, { "leaveType": "Casual", "count": 3 }, { "leaveType": "Medical", "count": 2 } ],
    "recentRequests": [ { "id": 1, "employee": { "name": "Kasun Perera" }, "status": "Pending" } ]
  }
}
```

---

## 14. Business rules enforced by the backend

| Rule | Where |
| --- | --- |
| Name, email and department are required; email must be well formed and unique (case-insensitive) | `employeeValidator.js`, unique index, service conflict check |
| Input is trimmed and whitespace collapsed; emails stored lower-case | `validators/common.js`, service |
| Employee must exist before a leave request is created | `leaveService.createLeaveRequest` |
| Leave type limited to `Annual`, `Casual`, `Medical` | validator + database CHECK |
| Dates must be real calendar dates in `YYYY-MM-DD` (`2026-02-30` and `2026-13-01` are rejected) | `utils/dates.js` |
| End date must be on or after start date | validator + database CHECK |
| Reason required, max 500 characters | validator |
| New requests are always `Pending` — a client-supplied `status` is ignored | `leaveRepository.insertLeaveRequest` hardcodes `'Pending'` |
| Only `Pending` requests can be approved or rejected | conditional `UPDATE ... WHERE status='Pending'`, 409 on 0 rows |
| Rejection requires a non-empty reason, which is stored | `validateRejectionPayload`, `markRejected` |
| Approved/rejected requests keep their decision; repeat attempts return 409 | conditional update |
| Rejected rows must have a reason, other rows must not | database CHECK |
| Employees with leave requests cannot be deleted | service check + `ON DELETE RESTRICT` |

Concurrent decisions: the transition is a single conditional `UPDATE`. If two approval calls
race, only one matches `status = 'Pending'`; the other receives `409` (covered by a test).

---

## 15. Design decisions and challenges

1. **SQLite driver instead of Prisma.** Prisma's CLI downloads engine binaries at install time;
   that download host is blocked in the environment where this assignment was built, and the
   current Prisma major (8.x) no longer exposes `prisma generate` / `prisma migrate`. Shipping a
   project whose setup fails would be worse than swapping the ORM. The replacement keeps every
   property Prisma would have provided: a declarative schema file (`001_init.sql`), reproducible
   migrations, prepared statements only, and a repository layer that isolates SQL from services.
   Migrating to Prisma later only means rewriting `server/src/data/*.js`.
2. **`/api` proxy instead of a hardcoded URL.** The Axios instance uses `VITE_API_BASE_URL` when
   set and otherwise calls `/api` on the current origin, which the Vite dev server proxies. This
   removed CORS and host-allow-list problems entirely, including when the app is served behind a
   port-forwarding preview URL.
3. **Server-side filtering and pagination.** Filtering in SQL keeps the UI honest (the counts
   come from the database) and keeps the component simple. Invalid filter values return `400`
   instead of silently returning everything.
4. **Status transitions in SQL, not in JavaScript.** A read-then-write check in a service can be
   interleaved by a second request; a conditional `UPDATE` cannot. The service still maps the
   "0 rows changed" case to a readable `409` message.
5. **Database-level guards.** CHECK constraints duplicate the service rules so a future endpoint
   (or a manual `sqlite3` session) cannot store `status='Rejected'` without a rejection reason,
   an inverted date range, or an unknown leave type.
6. **Two layers of validation, one source of truth.** The frontend validates for instant feedback
   (`client/src/utils/validation.js`), the backend validates for correctness
   (`server/src/validators/*`). Field keys match, so API error objects render next to the same
   inputs the client would have flagged.
7. **Deletion policy.** Deleting an employee with leave history would orphan audit data, so it is
   refused (409) and explained in the UI. Deletion is only allowed for employees with no requests.
8. **Shared summary state.** The sidebar counters, dashboard and reports page read one
   `SummaryProvider` that refreshes on navigation and after every mutation, so approving a request
   updates the dashboard without a manual reload.
9. **Modal focus management.** Portalled dialogs move focus to the first field and trap Tab. An
   early implementation re-focused after a timer and stole the caret while typing; the fix checks
   at fire time whether the user is already inside the dialog, and a regression test
   (`keeps focus in the reason field while typing`) covers it.
10. **Sticky action column.** Leave tables are horizontally scrollable on small screens; keeping
    the Approve/Reject column pinned prevents actions from being hidden off-screen at 1024 px.
11. **Recharts confined to two charts.** The donut (dashboard) and the bar chart (reports) are
    worth the bundle; everything else is plain CSS so charts cannot replace real numbers.
12. **Failure modes are classified, not guessed.** The client separates *no response* (backend
    down), *a proxy/gateway error page* (Vite answers HTTP 500, gateways answer 502/503/504),
    *a 4xx with the API's JSON envelope*, and *a 404 on the route* (wrong `VITE_API_BASE_URL`).
    Each gets its own message and only genuine connectivity failures show the "Start the backend"
    banner — an HTML error page is never described as a validation problem. See
    `client/src/services/api.js`.

---

## 16. Known limitations

* **No authentication.** Every API endpoint is public on the local machine, and the "admin"
  screens are a local demonstration interface (also stated in the sidebar and on
  `/admin/leaves`).
* **No leave balances, accruals or overlap detection.** Deliberately out of scope per the
  assignment; only date-range validity is enforced.
* **Single-database, single-process.** SQLite with WAL handles the expected load, but there is no
  horizontal scaling story.
* **Dates are calendar dates, not timestamps.** There is no timezone handling for "today"-relative
  rules (none exist in this version).
* **Rejected/approved decisions cannot be reversed.** No "reopen request" workflow.
* **No file uploads** (for example medical certificates) and no email notifications.
* **Pagination is page-number based** rather than cursor based; fine for this data volume.
* **Native dependency.** `better-sqlite3` needs prebuilt binaries or a C++ toolchain on the host.
* **Screenshots** were captured from this build at 1440 px and 375/768 px; other resolutions were
  checked manually during development but not captured.

---

## 17. Authentication and authorization

Authentication is **optional for this assignment and is not implemented**.

Consequences, stated plainly:

* `GET/POST /api/employees`, the leave endpoints and `/api/reports/summary` are not protected.
* Anyone who can reach port 5000 can approve or reject requests.
* The sidebar role label ("HR Administrator") and the `/admin/leaves` route are **not** security
  boundaries. There is no login screen, no session, no token, and no role check — nothing in the
  UI or API pretends otherwise.
* The UI labels the admin area as a *local demonstration interface*.

How it would be added:

1. `users` table with `email`, `password_hash` (Argon2/bcrypt) and `role` (`admin`, `hr`, `employee`),
   linked to `employees.id`.
2. `POST /api/auth/login` issuing a short-lived JWT (or an httpOnly session cookie), plus
   `POST /api/auth/logout` and `GET /api/auth/me`.
3. `authenticate` middleware verifying the token, and `authorize('admin')` middleware in front of
   approval endpoints and employee mutations.
4. Server-side ownership checks so an employee can only read/create their own requests.
5. Client-side route guards plus a login page; the UI would then be allowed to hide actions — but
   the API would remain the enforcement layer.
6. Rate limiting, audit logging of decisions (`approved_by`, `decided_at`) and CSRF protection if
   cookie sessions are used.

---

## 18. Future improvements

* Authentication + role-based authorization (see above), with decision auditing.
* Leave balances per employee per leave type per year, and overlap prevention.
* Multi-step approval workflow and cancellation by the employee.
* CSV/PDF export of the reports, and date-range filters on the reports page.
* File attachments for medical certificates (stored outside SQLite).
* E-mail notifications on submission and decision.
* Optimistic UI updates with rollback for approve/reject.
* End-to-end tests (Playwright) on top of the existing unit/integration suites.
* TypeScript migration for the API contract, with shared request/response types.

---

## 19. Project structure

```
intern-leave-management-assignme/
├── client/                          React + Vite frontend
│   ├── public/favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/              Button, Input, Select, Textarea, Modal, ConfirmDialog,
│   │   │   │                        Toast, Badge, Card, PageHeader, Pagination,
│   │   │   │                        EmptyState, ErrorMessage, LoadingSpinner
│   │   │   ├── dashboard/           StatCard, RecentLeaveRequests, LeaveTypeChart
│   │   │   ├── employees/           EmployeeForm, EmployeeTable
│   │   │   ├── layout/              AppLayout, Sidebar, Header, ApiStatusBanner
│   │   │   └── leaves/              LeaveRequestForm, LeaveRequestTable, LeaveFilters,
│   │   │                            RejectLeaveModal, LeaveRequestDetail, LeaveStatusBadge
│   │   ├── hooks/                   useEmployees, useLeaveRequests, useSummary, useToast,
│   │   │                            useDebouncedValue, useEscapeKey
│   │   ├── pages/                   DashboardPage, EmployeesPage, NewLeaveRequestPage,
│   │   │                            LeaveRequestsPage, ManageLeavesPage, ReportsPage,
│   │   │                            NotFoundPage
│   │   ├── services/                api, employeeService, leaveService, reportService
│   │   ├── test/setup.js
│   │   ├── utils/                   constants, format, validation
│   │   ├── App.jsx, main.jsx, index.css
│   ├── .env.example, eslintrc, tailwind.config.js, postcss.config.js, vite.config.js
│   └── package.json
├── server/                          Express + SQLite API
│   ├── db/
│   │   ├── migrations/001_init.sql  Schema
│   │   ├── index.js                 Connection helper (WAL, foreign keys)
│   │   ├── migrate.js               Migration runner
│   │   └── seed.js                  Development-only demo data
│   ├── src/
│   │   ├── controllers/             employeeController, leaveController, reportController
│   │   ├── data/                    employeeRepository, leaveRepository
│   │   ├── middleware/              errorHandler, notFound
│   │   ├── routes/                  employeeRoutes, leaveRoutes, reportRoutes
│   │   ├── services/                employeeService, leaveService, reportService
│   │   ├── utils/                   ApiError, asyncHandler, dates
│   │   ├── validators/              common, employeeValidator, leaveValidator,
│   │   │                            leaveQueryValidator
│   │   ├── app.js, server.js, config.js
│   ├── tests/                       employee.test.js, leave.test.js, report.test.js,
│   │                                helpers/testDb.js
│   ├── .env.example
│   └── package.json
├── docs/
│   ├── screenshots/                 Screenshots of the running application
│   └── DEPLOYMENT.md                A-to-Z guide for a public URL
├── scripts/
│   ├── setup.js                     One-shot install + .env + migrate + seed (npm run setup)
│   ├── dev.js                       Starts API, waits for /api/health, then Vite (npm run dev)
│   └── start-prod.js                Single-service production bootstrap (npm run start:prod)
├── Dockerfile / .dockerignore       Container image (API + built SPA, one port)
├── render.yaml                      Render Blueprint (build, disk, env, health check)
├── Procfile                         Railway / Heroku-style start command
├── .node-version                    Node 22 pin for hosting platforms
├── .gitignore
├── package.json                     Root convenience scripts
└── README.md
```


---

## 20. Deployment — running it globally

The application runs as **one service on one public URL**: the Express process serves both
`/api/*` and the compiled React bundle, so there is no separate frontend host and no CORS setup.

```
https://your-app.onrender.com/          → React app
https://your-app.onrender.com/api/...   → REST API (same origin)
https://your-app.onrender.com/api/health → health probe
```

### Verify production mode locally

```powershell
npm ci --prefix server
npm ci --prefix client
npm run build --prefix client        # creates client/dist
npm run db:migrate
npm run db:seed                      # OPTIONAL demo data

$env:NODE_ENV="production"
npm start                            # http://localhost:5000 serves UI + API
```

`GET /api/health` reports `"servesClient": true` when the built SPA is being served.

### One-command start with the production build

```powershell
npm run start:prod                   # sets NODE_ENV=production and boots the single service
```

### Deployment targets included in the repository

| File | Purpose |
| --- | --- |
| `render.yaml` | Render Blueprint: build, start, health check, persistent disk, env vars |
| `Dockerfile` + `.dockerignore` | Any Docker host (VPS, Fly.io, Koyeb, Railway) |
| `Procfile` | Railway / Heroku-style platforms |
| `.node-version` | Pins Node 22 on platforms that read it |
| `docs/DEPLOYMENT.md` | Full step-by-step guide (Render, Railway, Docker, custom domain, troubleshooting) |

**Full instructions: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)** — it covers account setup,
environment variables, attaching the SQLite volume, seeding demo data on the live instance, a
post-deploy acceptance checklist and a troubleshooting table.

### The one thing to be honest about

Container filesystems are ephemeral. Without a mounted disk/volume the SQLite file — and therefore
all data — is **reset on every redeploy**. Attach a persistent disk and point `DATABASE_FILE` inside
it (Render and Railway steps are in the guide). On a free tier the app still works perfectly; it
just starts empty after each deploy. This is the documented trade-off of SQLite over a managed
database, and swapping to Postgres would only touch `server/db/` and `server/src/data/`.

### Environment variables used in production

| Variable | Value on a host | Why |
| --- | --- | --- |
| `NODE_ENV` | `production` | Production logging, no internal error details in responses |
| `HOST` | `0.0.0.0` | Required so the platform router can reach the process |
| `DATABASE_FILE` | `/var/data/leave_manager.db` | Absolute path on the persistent volume |
| `PORT` | *set by the platform* | Never hardcode it on Render/Railway |
| `CLIENT_ORIGIN` | empty (or extra origins) | Same-origin requests are always allowed |

---

## 21. Troubleshooting

| Symptom | Fix |
| --- | --- |
| `better-sqlite3` fails to install on Windows | Install "Desktop development with C++" from Visual Studio Build Tools, or use a Node LTS version with a prebuilt binary |
| Amber **"The API is not reachable"** banner | The backend is not running (the app detects this on load and every 30 s). Run `npm run dev` from the repository **root** — it starts the API and the web app together — then press *Retry connection*. Check <http://localhost:5000/api/health> |
| UI works but every save fails, terminal 2 shows only Vite | You started only the client. `Ctrl+C`, then `npm run dev` from the root (or `npm run dev:server` in a second terminal) |
| `EADDRINUSE` on 5000 or 5173 | Another instance is running. Stop it, or change `PORT` in `server/.env` and `VITE_PROXY_TARGET` in `client/.env` |
| Charts look empty with a `ResponsiveContainer` warning | The container had zero height during the first paint; resize the window. The app renders a fixed-height wrapper, so this only appears in unusual embedding scenarios |
| `npm run db:seed` says "skipped" | The database already contains employees. Use `npm run db:seed -- --force` to replace the data with the demo set |
| Screenshots in `docs/` look outdated | They were captured from this exact build; re-capture with your own run if you change the UI |

---

### Final acceptance checklist

| Requirement | Status |
| --- | --- |
| Frontend and backend start successfully | ✅ verified |
| SQLite database initialises reproducibly | ✅ `npm run db:migrate` (+ auto-migrate on start) |
| Employees can be created and listed | ✅ UI + API + tests |
| Invalid employee input rejected | ✅ field-level 400s |
| Duplicate emails rejected | ✅ 409 + UI message |
| Leave requests can be submitted and persist | ✅ verified across restarts |
| Invalid date ranges rejected by the backend | ✅ 400 with field error |
| Requests can be approved / rejected with reason | ✅ UI + API + tests |
| Invalid status transitions prevented | ✅ 409, conditional update |
| Dashboard statistics reflect real data | ✅ SQL aggregates, refreshed after mutations |
| Search and filters work | ✅ server-side, both leave pages |
| UI matches the reference layout | ✅ dark navy sidebar, KPI cards, tables, badges, two-column form |
| Mobile layouts usable | ✅ drawer nav, stacked cards, scrollable tables |
| Tests executed | ✅ 39 backend + 37 frontend |
| Production build completes | ✅ `npm run build` |
| README setup instructions | ✅ this document |
| Screenshots show the real app | ✅ `docs/screenshots/` |
| No secrets committed | ✅ `.env` ignored, examples only |
| Git history contains real commits | ✅ see `git log` (one commit per completed milestone) |
| Known limitations documented | ✅ section 16/17 |
| Deployable as one public service | ✅ `render.yaml`, `Dockerfile`, `Procfile`; verified locally with `NODE_ENV=production npm start` |
