# Student Task Manager — Complete Guide

*Installation manual • User manual • Developer guide • Internal-assessment reference • Viva handbook*

> **How to read this guide.** Sections 1–5 get the project running. Sections 6–11 explain how it works. Section 12–13 are testing and troubleshooting. Sections 14–16 are for your demonstration and viva. Everything described here exists in the delivered code; things that are *only theory* are clearly marked **[THEORY ONLY]**.

## Contents
1. Project Introduction
2. Subject Coverage
3. Technology Stack
4. Installation and Prerequisites (Windows)
5. How to Run the Project
6. Complete Folder and File Explanation
7. Application Architecture
8. Database Design
9. Backend and API Reference
10. Frontend Explanation
11. Complete Code Walkthrough
12. Testing and Verification
13. Troubleshooting
14. Internal Assessment Demonstration
15. Viva Preparation Handbook
16. Quick Revision Sheet

---

## What was verified (read this first, honestly)

| Item | Status |
|---|---|
| Backend starts, all 8 endpoints work against a **real PostgreSQL 16** database (create, list, filter, sort, get, edit, complete/reopen, delete, stats, health) | ✅ Tested with `curl` in the build environment |
| Validation errors (400), not-found (404), database-down (503) | ✅ Tested (PostgreSQL was stopped and restarted to prove 503 and recovery) |
| Data persists after backend restart | ✅ Tested |
| CORS header for `http://localhost:5173` | ✅ Tested |
| Backend automated tests (`npm test`, 7 tests) | ✅ 7 passed |
| Frontend production build (`npm run build`) | ✅ Succeeded |
| Full React → Express → Prisma → PostgreSQL flow in a real browser (Chromium): add, validation, sort, filter, complete, reopen, edit, delete, reload persistence | ✅ 14 checks passed |
| `npx prisma migrate deploy` / `migrate dev` | ⚠️ **Not run in the build environment** (Prisma's engine download site was blocked there). The migration SQL file was applied to PostgreSQL directly with `psql` and the result tested. On your Windows PC, `migrate deploy` downloads its engine normally. If it ever complains, see Troubleshooting §13. |
| Running on Windows / PowerShell / Postman desktop app | ⚠️ Not run (build environment is Linux). Commands are standard and were written for Windows, but this is the first thing to confirm on your machine. The Postman collection file is valid JSON but was not imported into Postman here. |
| Prisma Studio (`npx prisma studio`) | ⚠️ Not run here. Optional; pgAdmin / `psql` are given as alternatives. |

---

# Section 1: Project Introduction

## 1.1 Title and purpose
**Student Task Manager** is a full-stack web application where a student records academic assignments (title, description, subject, due date), tracks whether each is pending or completed, and sees simple statistics.

## 1.2 Problem statement
Students receive assignments from many subjects with different deadlines. Notes scattered across notebooks, chats and memory lead to missed deadlines. A single, simple, persistent place to record and track tasks solves this.

## 1.3 Objectives
1. Build a working CRUD (Create, Read, Update, Delete) application.
2. Practise a layered backend: **routes → controllers → database access**.
3. Store data permanently in a **relational database (PostgreSQL)** using an **ORM (Prisma)** and **migrations**.
4. Build a **React** user interface that talks to the backend using HTTP and JSON.
5. Demonstrate validation, error handling, sorting and filtering.

## 1.4 Scope
**Included:** add, view, edit, delete tasks; mark pending/completed; counts (total/pending/completed); sort by due date (default) and filter by status; overdue highlighting; validation on both frontend and backend; consistent JSON errors; CORS; environment variables; migration.

**Limitations (deliberately not built — keeps the project explainable):**
- No login/accounts: every visitor of the app sees the same tasks (single-user tool).
- No pagination (all matching tasks are returned at once).
- No automated test that talks to the real database (the 7 automated tests cover validation and request rejection; the database flow was verified manually/with scripts).
- No deployment, Docker, caching, rate limiting, or notifications.
- No explicit database transaction is used (explained as theory in §8.10).

## 1.5 Main features
| # | Feature | Where |
|---|---|---|
| 1 | Add task (title, description, subject, due date) | Form → `POST /api/tasks` |
| 2 | View all tasks, sorted by due date | `GET /api/tasks` |
| 3 | Edit task | `PUT /api/tasks/:id` |
| 4 | Mark completed / reopen | `PATCH /api/tasks/:id/status` |
| 5 | Delete task | `DELETE /api/tasks/:id` |
| 6 | Total / pending / completed counters | `GET /api/tasks/stats` |
| 7 | Filter by status (All / Pending / Completed) | `GET /api/tasks?status=...` |
| 8 | Overdue badge for pending tasks past their due date | Frontend (`TaskItem.jsx`) |
| 9 | Health check proving the database connection | `GET /api/health` |

## 1.6 Why it suits an internal assessment
It is small enough to explain completely in 10 minutes, yet it exercises every layer of a real web application. Each subject (backend, database, full-stack) has clearly identifiable files and features you can open and show.

---

# Section 2: Subject Coverage

## 2.1 Subject A — Backend Development Foundations and Architecture (Node.js + Express)

| Concept | Status | Where in the project |
|---|---|---|
| Express server and startup | ✅ Implemented | `backend/src/server.js`, `app.js` |
| HTTP methods GET/POST/PUT/PATCH/DELETE | ✅ | `routes/taskRoutes.js` |
| Status codes 200, 201, 400, 404, 500, 503 | ✅ | controllers + `errorHandler.js` |
| JSON request/response | ✅ | `express.json()` in `app.js`; `res.json()` in controllers |
| RESTful CRUD endpoints | ✅ | 7 task endpoints + health |
| async/await | ✅ | every controller function |
| Request validation | ✅ | `utils/validation.js` |
| Centralised error handling | ✅ | `middleware/errorHandler.js`, `utils/httpError.js` |
| Separation: routes / controllers / database access | ✅ | `routes/`, `controllers/`, `prisma.js` |
| Safe handling of user data | ✅ | validation + trimming + Prisma parameterised queries |
| Middleware | ✅ | `cors`, `express.json`, request logger, 404 handler, error handler |
| Environment variables | ✅ | `dotenv`, `backend/.env` |
| Concurrent requests | ✅ (by Node's design) + `Promise.all` in `getStats` | explained §7.7 |
| Graceful shutdown | ✅ | `server.js` |
| Postman testing | ✅ collection file included | `postman/Student_Task_Manager.postman_collection.json` |
| Authentication, rate limiting, security headers (Helmet) | ❌ **[THEORY ONLY]** | not implemented |

## 2.2 Subject B — Database Engineering (PostgreSQL + Prisma)

| Concept | Status | Where |
|---|---|---|
| Relational table design | ✅ | `tasks` table (one entity) |
| Primary key (auto-increment) | ✅ | `id SERIAL PRIMARY KEY` |
| Data types (VARCHAR, DATE, TIMESTAMP, ENUM) | ✅ | `schema.prisma`, migration SQL |
| NOT NULL / DEFAULT / length constraints | ✅ | schema |
| ENUM integrity (`PENDING`/`COMPLETED` only) | ✅ | `TaskStatus` enum |
| Indexes on `status` and `dueDate` | ✅ | schema `@@index` |
| Prisma schema + generated client | ✅ | `prisma/schema.prisma`, `npx prisma generate` |
| Migration | ✅ one migration file | `prisma/migrations/20261022000000_init/migration.sql` |
| CRUD through Prisma | ✅ | `create`, `findMany`, `findUnique`, `update`, `delete`, `count` |
| Sorting & filtering in the database | ✅ | `orderBy`, `where` → SQL `ORDER BY`, `WHERE` |
| Raw SQL (safe tagged template) | ✅ once | `SELECT 1` in health check |
| SQL visible for demo | ✅ | `LOG_QUERIES=true` |
| Explicit transactions (`prisma.$transaction`) | ❌ **[THEORY ONLY]** | each operation is a single statement, which PostgreSQL already runs atomically |
| Foreign keys / relations between tables | ❌ **[THEORY ONLY]** | only one table in this project |

## 2.3 Subject C — Full-Stack Development (React + Node + Express + PostgreSQL + Prisma)

| Concept | Status | Where |
|---|---|---|
| React components | ✅ 6 components | `frontend/src/` |
| Form for add/edit | ✅ | `TaskForm.jsx` |
| Task list + summary | ✅ | `TaskList.jsx`, `TaskItem.jsx`, `TaskSummary.jsx` |
| HTTP requests from React to Express | ✅ | `api.js` (uses `fetch`) |
| Loading / empty / error states | ✅ | `TaskList.jsx`, `App.jsx` alert |
| Form validation + readable errors | ✅ | `TaskForm.jsx` (client) + backend `details` |
| UI refresh after database change | ✅ | `loadData()` after every write |
| CORS for local development | ✅ | `app.js` |
| Git-ready layout, `.gitignore`, README | ✅ | project root |
| Routing (React Router), global state libraries | ❌ **[THEORY ONLY]** | deliberately avoided |

---

# Section 3: Technology Stack

| Technology | What it is | Why needed | What it does here | Talks to | Simpler alternative not chosen because |
|---|---|---|---|---|---|
| **Node.js** | JavaScript runtime that runs JS outside the browser | Backend must run somewhere | Runs the Express server and Prisma | OS, PostgreSQL (through Prisma) | — |
| **npm** | Node's package manager | Installs libraries | Installs Express, Prisma, React... | npm registry | — |
| **Express.js** (v5) | Minimal web framework for Node | Handles HTTP routing/middleware | Defines `/api/tasks...` endpoints | React (HTTP), Prisma | Node's raw `http` module needs much more code |
| **PostgreSQL** | Relational (SQL) database server | Permanent storage | Stores the `tasks` table | Prisma (via `pg`) | A JSON file/array would lose data/concurrency safety and is not allowed by the brief |
| **Prisma ORM** (v7) | Tool that maps database tables to JavaScript objects; also manages migrations | Avoids hand-written SQL, gives safe queries and versioned schema | `prisma.task.findMany(...)` etc.; generates the client; runs migrations | Express controllers, PostgreSQL | Raw SQL strings are error-prone and injection-prone |
| **`@prisma/adapter-pg` + `pg`** | Driver adapter: the actual connection between Prisma 7 and PostgreSQL | Prisma 7 requires a driver adapter | Opens/pools PostgreSQL connections | Prisma ↔ PostgreSQL | — |
| **dotenv** | Loads `.env` into `process.env` | Keeps passwords out of code | Provides `DATABASE_URL`, `PORT`, `CORS_ORIGIN` | Node | Hard-coding secrets is unsafe |
| **cors** | Express middleware adding CORS headers | Browser blocks cross-origin calls otherwise | Allows `http://localhost:5173` to call port 5000 | Browser ↔ Express | A Vite proxy would hide CORS, but the brief asks for CORS |
| **React** (v19) | JavaScript library for building UIs from components | Interactive UI that updates without page reloads | Renders form, list, summary | Express (via fetch) | Plain HTML/JS would need manual DOM updates |
| **Vite** | Fast dev server and bundler | Runs/builds the React app | `npm run dev`, `npm run build` | Browser | Create-React-App is obsolete |
| **Plain CSS** | Styling | Simple, no extra concepts | `styles.css` | Browser | UI frameworks add things to explain |
| **Postman** | API testing application | Test the backend without the UI | Sends requests, shows responses | Express | `curl` also works but is less friendly |
| **Git/GitHub** | Version control / hosting | Project organisation | `.gitignore`, README | — | — |

---

# Section 4: Installation and Prerequisites (Windows)

> **Terminal basics.** A *terminal* is a window where you type commands. We use **Windows PowerShell**. Open it: press the **Windows key**, type `PowerShell`, press **Enter**. Commands are shown in grey boxes; type (or paste) them and press **Enter**. `cd <folder>` means "go into that folder".

## 4.1 Install Node.js (includes npm)
1. Open https://nodejs.org and download the **LTS** installer (Node **22 or newer** is required — the project was built with Node 22).
2. Run the installer, keep all defaults, click Next until Finish.
3. **Close and reopen PowerShell**, then verify:
```powershell
node -v
npm -v
```
*(Run anywhere.)* Both should print version numbers like `v22.x.x` and `10.x.x`. If you see "not recognized", see §13.1.

**If PowerShell says "running scripts is disabled" when using `npm`,** run once:
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```
Type `Y` and Enter. This lets you run npm in your own user account.

## 4.2 Install PostgreSQL
1. Go to https://www.postgresql.org/download/windows/ and click **Download the installer** (EDB). Pick a current version (16 or newer; the project was tested on 16).
2. Run it. Keep the defaults (components: PostgreSQL Server, pgAdmin 4, Command Line Tools).
3. When asked, set a **password for the database superuser `postgres`**. **Write it down — you need it later.** Keep port **5432**.
4. Finish the installer (you can skip Stack Builder).
5. PostgreSQL now runs automatically as a Windows service. Verify: press Windows key → type `Services` → open it → find **postgresql-x64-...** → Status should be **Running**.

## 4.3 Create the database
**Option A — pgAdmin (graphical, easiest):**
1. Open **pgAdmin 4** from the Start menu. Enter your master password if asked.
2. Expand **Servers → PostgreSQL**; enter the `postgres` password you set.
3. Right-click **Databases → Create → Database…**
4. Name: `student_task_manager` → **Save**.

**Option B — PowerShell with `psql`:**
```powershell
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "CREATE DATABASE student_task_manager;"
```
*(Run anywhere. Change `16` to your installed version number. It asks for the `postgres` password.)* Expected output: `CREATE DATABASE`.

*Using the `postgres` superuser is simplest for a college project. (Optional, [THEORY ONLY] advice: in production you would create a separate limited user.)*

## 4.4 Extract the project
1. Copy `Student_Task_Manager_Project.zip` to a simple folder, e.g. `C:\Projects`.
2. Right-click the ZIP → **Extract All…** → extract into `C:\Projects`.
3. You should now have `C:\Projects\student-task-manager\` containing `backend`, `frontend`, `postman`, `README.md`, `.gitignore`.

> Avoid very deep folders and folders synced by OneDrive; `C:\Projects` is ideal.

## 4.5 Configure environment variables (backend)
Open **PowerShell #1** (this will become your *backend terminal*):
```powershell
cd C:\Projects\student-task-manager\backend
Copy-Item .env.example .env
notepad .env
```
*(Copies the template to `.env` and opens it in Notepad.)* Edit so it looks like this, **replacing `YOUR_PASSWORD`** with your `postgres` password:
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/student_task_manager"
PORT=5000
CORS_ORIGIN="http://localhost:5173"
LOG_QUERIES=false
```
Save (Ctrl+S) and close Notepad.

**Password with special characters** (`@ : / # ? %`) must be URL-encoded in `DATABASE_URL` (e.g. `@` → `%40`, `#` → `%23`). Easiest: choose a simple password.

| Variable | Meaning |
|---|---|
| `DATABASE_URL` | How Prisma connects: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE` |
| `PORT` | Port where the API listens (5000) |
| `CORS_ORIGIN` | Browser address allowed to call the API (the React app) |
| `LOG_QUERIES` | `true` prints the SQL Prisma sends (great for demos) |

The frontend has an *optional* variable `VITE_API_URL` (default `http://localhost:5000/api`). You normally don't need to create `frontend/.env`.

## 4.6 Install backend dependencies, generate the Prisma client, run the migration
In **PowerShell #1**, folder `backend`:
```powershell
npm install
```
*Reads `package.json` and downloads libraries into `backend\node_modules` (1–2 minutes).*
```powershell
npx prisma generate
```
*Reads `prisma\schema.prisma` and generates the Prisma Client — the JavaScript code that your controllers call (`prisma.task...`). Run it after `npm install` and whenever `schema.prisma` changes.*
```powershell
npx prisma migrate deploy
```
*Applies the migration in `prisma\migrations` to your database: creates the `TaskStatus` type, the `tasks` table and its indexes. Expected output ends with "All migrations have been successfully applied."*

## 4.7 Install frontend dependencies
Open **PowerShell #2** (the *frontend terminal*):
```powershell
cd C:\Projects\student-task-manager\frontend
npm install
```
*Downloads React, Vite etc. into `frontend\node_modules`.*

## 4.8 Install Postman
Download from https://www.postman.com/downloads/, install, and open (a free account/“Skip and go to the app” is fine). To load the prepared requests: **Import → Upload Files →** choose `C:\Projects\student-task-manager\postman\Student_Task_Manager.postman_collection.json`. The collection uses a variable `baseUrl = http://localhost:5000/api`.

---

# Section 5: How to Run the Project

## 5.1 Expected folder structure after extraction and installation
```
C:\Projects\student-task-manager\
├── .gitignore
├── README.md
├── backend\
│   ├── .env                  ← you created (secret, not in Git)
│   ├── .env.example
│   ├── package.json / package-lock.json
│   ├── prisma.config.js
│   ├── prisma\
│   │   ├── schema.prisma
│   │   └── migrations\
│   │       ├── migration_lock.toml
│   │       └── 20261022000000_init\migration.sql
│   ├── src\ (server.js, app.js, prisma.js, routes\, controllers\, middleware\, utils\)
│   ├── tests\validation.test.js
│   └── node_modules\         ← created by npm install
├── frontend\
│   ├── index.html, vite.config.js, package.json, package-lock.json, .env.example
│   ├── src\ (main.jsx, App.jsx, api.js, styles.css, components\)
│   └── node_modules\
└── postman\Student_Task_Manager.postman_collection.json
```

## 5.2 Start the backend (PowerShell #1)
```powershell
cd C:\Projects\student-task-manager\backend
npm run dev
```
Expected output:
```
Student Task Manager API running at http://localhost:5000
Health check:           http://localhost:5000/api/health
```
(`npm run dev` restarts automatically when you edit code; `npm start` runs without auto-restart.) **Leave this window open.**

## 5.3 Start the frontend (PowerShell #2)
```powershell
cd C:\Projects\student-task-manager\frontend
npm run dev
```
Expected: `VITE ... ready` and `Local: http://localhost:5173/`. **Leave open.**

## 5.4 Open the app
Browser → **http://localhost:5173**

| Part | URL / port |
|---|---|
| React app (Vite) | http://localhost:5173 |
| Express API | http://localhost:5000/api |
| PostgreSQL | localhost:5432 |

## 5.5 Verify the database connection
Open **http://localhost:5000/api/health** in the browser. Expected:
```json
{"status":"ok","database":"connected"}
```
If PostgreSQL is unreachable you get `503` with `{"status":"error","database":"unreachable"}`.

## 5.6 Verify the application works
1. Open http://localhost:5173 → summary shows `0 / 0 / 0`, list says "No tasks yet".
2. Add a task → it appears; Total becomes 1.
3. Open http://localhost:5000/api/tasks → you see the same task as JSON (proof it came from the backend/database).
4. Run the checklist in §12 for a full check.

## 5.7 Stop and restart
- **Stop:** click in each PowerShell window and press **Ctrl + C** (answer `Y` if asked to terminate the batch job).
- **Restart:** run `npm run dev` again in each folder. You do **not** repeat `npm install`, `generate` or `migrate`. Your tasks are still there because they are stored in PostgreSQL, not in the app.
- After closing PowerShell completely, reopen it, `cd` into the folders again, run `npm run dev` again.

---

# Section 6: Complete Folder and File Explanation

## 6.1 Root
| File | Purpose |
|---|---|
| `README.md` | Short quick-start for GitHub readers. |
| `.gitignore` | Tells Git not to upload `node_modules/`, `.env` (passwords), `dist/`, logs. |
| `backend/` | The Express + Prisma API. |
| `frontend/` | The React app. |
| `postman/` | Importable Postman collection of all requests. |

## 6.2 Backend (`backend/`)

### Configuration files
| File | Contains / why it exists / who uses it |
|---|---|
| `package.json` | Lists dependencies (express, cors, dotenv, @prisma/client, @prisma/adapter-pg, pg; dev: prisma) and scripts (`start`, `dev`, `test`, `prisma:*`). Used by npm. |
| `package-lock.json` | Exact versions installed, so your install matches mine. Generated by npm; commit it. |
| `.env.example` | Template of settings with placeholders (safe to share). You copy it to `.env`. |
| `.env` | **Your** real settings (password). Read by `dotenv` (in `server.js`) and `prisma.config.js`. Never commit. |
| `prisma.config.js` | Prisma 7 CLI config: where the schema and migrations are, and the database URL (from `.env`). Used by `npx prisma ...` commands only. |

### Database files (`backend/prisma/`)
| File | Contains / why / used by |
|---|---|
| `schema.prisma` | The single source of truth for the data model: `TaskStatus` enum and `Task` model. Read by `prisma generate` (creates the client) and by migration tooling. |
| `migrations/20261022000000_init/migration.sql` | The SQL that creates the enum, `tasks` table and indexes. Executed by `prisma migrate deploy`. |
| `migrations/migration_lock.toml` | Records that this project uses PostgreSQL so migrations aren't mixed with another DB type. |

### Source code (`backend/src/`) — request path order
| File | What it contains | Why | Imported by / depends on |
|---|---|---|---|
| `server.js` | Loads `.env`, starts listening on `PORT`, handles port-in-use error, closes DB on Ctrl+C | Entry point (`npm start`) | imports `app.js`, `prisma.js` |
| `app.js` | Creates the Express app: CORS, JSON parser, request logger, `/api/health`, mounts task routes, 404 + error handlers | Wires everything; separate from `server.js` so tests can import the app without starting a port | imported by `server.js`, tests; imports routes, middleware, `prisma.js` |
| `routes/taskRoutes.js` | Maps method + URL to controller functions | "Which function handles this URL?" | imported by `app.js`; imports `taskController.js` |
| `controllers/taskController.js` | 7 functions (list, stats, get, create, update, updateStatus, delete) — validate input, call Prisma, send JSON | Business logic of each endpoint | imported by routes; uses `prisma.js`, `validation.js`, `httpError.js` |
| `prisma.js` | Creates the one shared Prisma Client with the PostgreSQL adapter | Single database access point | used by controllers, `app.js`, `server.js` |
| `middleware/errorHandler.js` | `notFound` (unknown URL → 404) and `errorHandler` (every error → consistent JSON, correct status) | Centralised error handling | registered last in `app.js` |
| `utils/validation.js` | Pure functions: `validateTaskInput`, `validateStatus`, `parseId`, `parseDueDate` | Validation rules in one testable place | controllers, tests |
| `utils/httpError.js` | `HttpError` class (status + message + details) | Lets controllers say "respond 404 with this message" by throwing | controllers, `errorHandler.js` |

### Tests
| File | Contents |
|---|---|
| `tests/validation.test.js` | 7 tests using Node's built-in test runner: valid/invalid input, impossible dates, status values, id parsing (including `"1; DROP TABLE tasks"`), and the live API rejecting bad requests with 400/404 *without needing a database*. Run `npm test`. |

## 6.3 Frontend (`frontend/`)
| File | Contents / purpose | Used by |
|---|---|---|
| `package.json` | react, react-dom; dev: vite, @vitejs/plugin-react; scripts `dev`, `build`, `preview` | npm |
| `vite.config.js` | Enables React plugin; fixes dev port to 5173 (the CORS-allowed origin) | Vite |
| `index.html` | The single HTML page with `<div id="root">` and the script tag | browser/Vite |
| `.env.example` | Optional `VITE_API_URL` | `api.js` |
| `src/main.jsx` | Mounts `<App />` into `#root`, imports CSS | `index.html` |
| `src/App.jsx` | Parent component: owns all state, loads data, handles save/toggle/delete | `main.jsx` |
| `src/api.js` | Only place that calls `fetch`; defines `ApiError`; one function per endpoint | `App.jsx`, `TaskForm.jsx` (imports `ApiError`) |
| `src/components/TaskSummary.jsx` | Three counter boxes | `App.jsx` |
| `src/components/TaskForm.jsx` | Add/edit form with validation | `App.jsx` |
| `src/components/FilterBar.jsx` | All/Pending/Completed buttons | `App.jsx` |
| `src/components/TaskList.jsx` | Loading / empty / list | `App.jsx` |
| `src/components/TaskItem.jsx` | One task row with buttons and badges | `TaskList.jsx` |
| `src/styles.css` | All styling | `main.jsx` |

## 6.4 Where does a given piece of code belong? (quick finder)
- "Which URL does X?" → `routes/taskRoutes.js`
- "What happens inside that URL?" → `controllers/taskController.js`
- "What makes input valid?" → `utils/validation.js` (backend), top of `TaskForm.jsx` (frontend)
- "How do errors become responses?" → `middleware/errorHandler.js`
- "What does the table look like?" → `prisma/schema.prisma`, `migration.sql`
- "How does React call the server?" → `frontend/src/api.js`

---

# Section 7: Application Architecture

## 7.1 Diagram
```
┌──────────────────────────┐   HTTP + JSON    ┌────────────────────────────┐   Prisma Client   ┌─────────────────┐
│  BROWSER: React (Vite)   │ ───────────────► │  EXPRESS API (Node.js)     │ ────────────────► │  PostgreSQL     │
│  localhost:5173          │                  │  localhost:5000            │  (pg driver, SQL) │  localhost:5432 │
│                          │ ◄─────────────── │                            │ ◄──────────────── │                 │
│  App.jsx, components     │   JSON response  │  routes → controllers      │   rows            │  table "tasks"  │
│  api.js (fetch)          │                  │  validation, errors        │                   │                 │
└──────────────────────────┘                  └────────────────────────────┘                   └─────────────────┘
        FRONTEND                                        BACKEND                  ORM                DATABASE
```

## 7.2 Roles
| Layer | Role |
|---|---|
| **Frontend** (React) | What the user sees and clicks; sends requests; shows results. Runs in the browser. Cannot touch the database directly. |
| **Backend** (Express) | Receives requests, validates, applies logic, decides responses. Runs on the server. |
| **API** | The *contract* between frontend and backend: the list of URLs, methods, and JSON shapes (§9). Not a separate program — it is the set of endpoints the backend exposes. |
| **ORM** (Prisma) | Translates JavaScript calls (`prisma.task.findMany`) into SQL and converts rows back into objects. |
| **Database** (PostgreSQL) | Stores data permanently and enforces constraints. |

## 7.3 How JSON is used
JSON is text that represents objects, e.g. `{"title":"Essay","dueDate":"2026-11-05"}`. React converts a JS object to JSON with `JSON.stringify` and sends it in the request body; Express's `express.json()` turns it back into `req.body`; the controller sends the answer with `res.json(...)`; React reads it with `response.json()`.

## 7.4 Request flow in one sentence
React `fetch` → Express middleware (CORS, JSON parse, logger) → route → controller (validate) → Prisma → SQL → PostgreSQL → rows → Prisma object → controller `res.json` → React updates state → screen re-renders.

## 7.5 What happens for each action

### Create a task
1. User fills the form and clicks **Add task**. `TaskForm.handleSubmit` runs `validate()`. If errors → shown, nothing is sent.
2. `onSubmit(values)` → `App.handleSave` → `api.createTask` → `fetch("POST /api/tasks", body JSON)`.
3. Browser first checks CORS (allowed because origin = `http://localhost:5173`).
4. Express: `cors` → `express.json()` fills `req.body` → logger registers → router matches `POST /` under `/api/tasks` → `createTask`.
5. `validateTaskInput` trims text, checks lengths and the date. Invalid → `throw HttpError(400, ..., details)` → `errorHandler` returns 400 JSON → React shows field messages.
6. Valid → `prisma.task.create({ data })` → SQL `INSERT ... RETURNING ...` (status defaults to `PENDING`; `createdAt` default; `updatedAt` set by Prisma).
7. Controller sends `201` + the saved task (with its new `id`).
8. `App.handleSave` calls `loadData()` → `GET /api/tasks` and `GET /api/tasks/stats` in parallel → state updates → list and counters re-render; the form clears.

### Edit a task
Click **Edit** → `editingTask` state is set → the form re-mounts pre-filled (because `key` changes) and says "Save changes" → submit → `PUT /api/tasks/:id` → validate → `prisma.task.update({ where:{id}, data })` (if id doesn't exist Prisma throws code `P2025` → handled as 404) → refresh.

### Complete / reopen
Click **Mark done** → `handleToggle` flips the status → `PATCH /api/tasks/:id/status` with `{"status":"COMPLETED"}` → `validateStatus` → `prisma.task.update({ data:{status} })` → refresh (counters change).

### Delete
Click **Delete** → `window.confirm` → `DELETE /api/tasks/:id` → `prisma.task.delete` → returns the deleted task and a message → refresh.

## 7.6 Asynchronous operations here
Network and database calls take time. `async/await` lets code *wait for a result without freezing everything*. Examples: `await prisma.task.findMany(...)` in the backend (Node serves other requests while PostgreSQL works), and `await api.fetchTasks(...)` in React (the page stays responsive; `loading` state shows a message). `Promise.all([...])` runs two requests at once (tasks + stats in React; two `count` queries in the backend).

## 7.7 Concurrent requests
Node runs your JavaScript on one thread but handles many requests by switching whenever one is waiting for I/O (the *event loop*). The `pg` library keeps a **pool** of database connections so several queries can run simultaneously. Each single Prisma operation is one SQL statement, which PostgreSQL executes atomically. Limitation: if two users edit the same task at nearly the same time, the later save wins ("last write wins"); there is no locking/version check **[THEORY ONLY]**.

---

# Section 8: Database Design

## 8.1 The actual Prisma schema (`backend/prisma/schema.prisma`)
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

enum TaskStatus {
  PENDING
  COMPLETED
}

model Task {
  id          Int        @id @default(autoincrement())
  title       String     @db.VarChar(120)
  description String     @default("") @db.VarChar(1000)
  subject     String     @db.VarChar(60)
  dueDate     DateTime   @db.Date
  status      TaskStatus @default(PENDING)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@index([status])
  @@index([dueDate])
  @@map("tasks")
}
```
(The database URL is supplied by `prisma.config.js` for the CLI and by `prisma.js` for the running app.)

## 8.2 The SQL created by the migration
```sql
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'COMPLETED');

CREATE TABLE "tasks" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "description" VARCHAR(1000) NOT NULL DEFAULT '',
    "subject" VARCHAR(60) NOT NULL,
    "dueDate" DATE NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "tasks_status_idx" ON "tasks"("status");
CREATE INDEX "tasks_dueDate_idx" ON "tasks"("dueDate");
```

## 8.3 Field by field
| Field | Prisma type → PostgreSQL | Constraint | Why |
|---|---|---|---|
| `id` | `Int` → `SERIAL` (integer + auto sequence) | **Primary key**, unique, not null | Unique identity of each task; used in URLs |
| `title` | `String` → `VARCHAR(120)` | NOT NULL | Short required name |
| `description` | `String` → `VARCHAR(1000)` | NOT NULL, default `''` | Optional text; empty string instead of NULL keeps code simple |
| `subject` | `String` → `VARCHAR(60)` | NOT NULL | Subject name (kept as text in one table for simplicity) |
| `dueDate` | `DateTime @db.Date` → `DATE` | NOT NULL | Only a calendar date matters; avoids time-zone confusion |
| `status` | enum → `TaskStatus` | NOT NULL, default `PENDING` | Database itself only accepts `PENDING` or `COMPLETED` |
| `createdAt` | `DateTime` → `TIMESTAMP(3)` | NOT NULL, default now | When the row was created (UTC) |
| `updatedAt` | `DateTime @updatedAt` → `TIMESTAMP(3)` | NOT NULL | Prisma sets it automatically on every update (done by Prisma, not by a database trigger) |

**Indexes** (`@@index`) speed up the two things we filter/sort by (`status`, `dueDate`). With a handful of rows they make no visible difference — they are a design habit that matters as data grows.

**Design choice:** one table is enough for the requirements. Splitting `subject` into its own table with a foreign key would be more normalised **[THEORY ONLY — mentioned as future improvement]** but would add complexity to explain.

## 8.4 Prisma model ↔ table
`model Task` becomes table `tasks` (`@@map("tasks")` sets the lowercase table name). Each field becomes a column. `enum TaskStatus` becomes a PostgreSQL enum type. Prisma Client is **generated** from this schema, which is why `prisma.task.create({ data:{ title... } })` is type-aware of your columns and why you must run `npx prisma generate` after changing the schema.

## 8.5 Example record
Database row → as returned by the API:
```json
{
  "id": 1,
  "title": "Math assignment",
  "description": "Chapter 4 exercises",
  "subject": "Mathematics",
  "dueDate": "2026-11-10",
  "status": "PENDING",
  "createdAt": "2026-10-22T08:50:36.409Z",
  "updatedAt": "2026-10-22T08:50:36.409Z"
}
```
(The controller's `toJson()` formats `dueDate` as plain `YYYY-MM-DD`.)

## 8.6 Migrations
A **migration** is a versioned SQL file describing a schema change. Instead of everyone creating tables by hand, you run one command and the database gets the same structure. Prisma stores which migrations were applied in a table `_prisma_migrations` so each runs only once.
- `npx prisma migrate deploy` — **applies** existing migration files (what you use on your PC).
- `npx prisma migrate dev --name something` — **developer command**: after you edit `schema.prisma`, it creates a new migration file and applies it. Needs permission to create a temporary "shadow" database (fine with the `postgres` user). Script alias: `npm run prisma:migrate:dev`.

## 8.7 CRUD meaning in this application
| Operation | SQL idea | Prisma call used |
|---|---|---|
| **C**reate | `INSERT` | `prisma.task.create` |
| **R**ead | `SELECT` | `findMany`, `findUnique`, `count` |
| **U**pdate | `UPDATE` | `prisma.task.update` |
| **D**elete | `DELETE` | `prisma.task.delete` |

## 8.8 How Prisma becomes SQL (real captured examples)
With `LOG_QUERIES=true` in `.env`, restart the backend and the terminal prints the SQL. These were captured from the running project:

`GET /api/tasks?status=PENDING` → `prisma.task.findMany({ where:{status:"PENDING"}, orderBy:[{dueDate:"asc"},{id:"asc"}] })`:
```sql
SELECT "id","title","description","subject","dueDate","status"::text,"createdAt","updatedAt"
FROM "public"."tasks"
WHERE "status" = CAST($1::text AS "public"."TaskStatus")
ORDER BY "dueDate" ASC, "id" ASC
```
(Prisma prints fully-qualified column names; shortened here for readability. `$1` is a **parameter** — the value `PENDING` is sent separately from the SQL text.)

`POST /api/tasks` → `prisma.task.create(...)` → `INSERT INTO "public"."tasks" (...) VALUES ($1,$2,$3,$4,CAST($5::text AS "public"."TaskStatus"),$6,$7) RETURNING ...`

`GET /api/tasks/stats` → two `prisma.task.count(...)` → `SELECT COUNT(*) ... WHERE "status" = $1`.

## 8.9 Sorting and filtering
- **Filtering:** `where: status ? { status } : {}` → SQL `WHERE status = ...`. Allowed values are validated first.
- **Sorting:** `orderBy: [{ [sort]: order }, { id: "asc" }]` → `ORDER BY ... , id ASC`. Default: `dueDate asc` (earliest deadline first). The extra `id` makes the order stable when two tasks share a due date. Allowed `sort` values: `dueDate`, `createdAt`, `title`; `order`: `asc`/`desc` (whitelisted, so users cannot inject column names).
- **Counting:** `count({ where:{status} })` → `COUNT(*)`.

All of this happens **inside PostgreSQL**, not by filtering arrays in JavaScript.

## 8.10 Invalid data and data integrity
Three layers protect the data:
1. **React form validation** (convenience; can be bypassed).
2. **Express validation** (`validation.js`; the real gatekeeper) → HTTP 400 with messages.
3. **Database constraints** (NOT NULL, VARCHAR limits, enum, DATE type) — last line of defence; e.g. an invalid enum value would be rejected by PostgreSQL itself.

## 8.11 Safe database access (SQL injection)
SQL injection happens when user text is glued into an SQL string. Here, user data never becomes part of SQL text: Prisma sends it as **bound parameters** (`$1`, `$2`…). The `id` in the URL is also checked to be a plain integer (`"1; DROP TABLE tasks"` is rejected with 400 — see the unit test). The only raw SQL is the constant ``SELECT 1`` in the health check.

## 8.12 Transactions — implemented vs theory
- **ACID** (Atomicity, Consistency, Isolation, Durability) is the set of guarantees PostgreSQL gives to every transaction. **[Applies automatically]** — each single `INSERT/UPDATE/DELETE` here runs as one atomic statement; that is why a task can't be "half saved".
- **Explicit transactions** (`prisma.$transaction([...])`) are needed when several writes must succeed or fail *together* (e.g. transferring money between two rows). This project has no such operation, so using one would be artificial. **[THEORY ONLY — not implemented]**
- **Durability** is shown in practice: restart the server (or the PC) and tasks remain.

---

# Section 9: Backend and API Reference

Base URL: `http://localhost:5000/api`. All bodies are JSON (`Content-Type: application/json`).

**Error format (all errors):**
```json
{ "error": "Validation failed", "details": { "title": "Title is required" } }
```
`details` appears only for validation errors.

**Validation rules** (POST/PUT): `title` required, ≤120 chars; `subject` required, ≤60; `description` optional text, ≤1000; `dueDate` required, real date `YYYY-MM-DD`. Text is trimmed.

## 9.1 `GET /api/health`
- **Purpose:** proves the server runs and PostgreSQL is reachable.
- **Success 200:** `{"status":"ok","database":"connected"}`
- **Error 503:** `{"status":"error","database":"unreachable"}`
- **Internally:** runs ``SELECT 1`` through Prisma.

## 9.2 `GET /api/tasks`
- **Purpose:** list tasks, optionally filtered/sorted.
- **Query parameters (all optional):** `status` = `PENDING` | `COMPLETED`; `sort` = `dueDate` (default) | `createdAt` | `title`; `order` = `asc` (default) | `desc`.
- **Examples:** `/api/tasks` • `/api/tasks?status=PENDING` • `/api/tasks?status=COMPLETED&sort=createdAt&order=desc`
- **Success 200:** array of tasks (`[]` when none).
```json
[ { "id": 2, "title": "Lab report", "description": "", "subject": "Physics", "dueDate": "2026-11-02", "status": "PENDING", "createdAt": "...", "updatedAt": "..." } ]
```
- **Errors:** `400` `{"error":"sort must be dueDate, createdAt or title"}` (similarly for bad `status`/`order`); `503` database down.
- **Internally:** validates query → `prisma.task.findMany({ where, orderBy })`.

## 9.3 `GET /api/tasks/stats`
- **Purpose:** counters for the summary boxes.
- **Success 200:** `{"total":2,"pending":1,"completed":1}`
- **Internally:** two `prisma.task.count` queries in parallel (`Promise.all`); `total = pending + completed`.
- *Route order matters:* it is declared before `/:id`, otherwise "stats" would be treated as an id.

## 9.4 `GET /api/tasks/:id`
- **Parameter:** `id` — positive integer.
- **Success 200:** one task object.
- **Errors:** `400` `{"error":"Task id must be a positive whole number"}`; `404` `{"error":"Task 999 not found"}`.
- **Internally:** `prisma.task.findUnique({ where:{id} })`; `null` → 404.

## 9.5 `POST /api/tasks`
- **Purpose:** create a task.
- **Request body:**
```json
{ "title": "Math assignment", "description": "Chapter 4 exercises", "subject": "Mathematics", "dueDate": "2026-11-10" }
```
- **Success 201:** the created task, including `id` and `status: "PENDING"`.
- **Errors:** `400`:
```json
{ "error": "Validation failed", "details": { "title": "Title is required", "dueDate": "Due date is required and must be a real date (YYYY-MM-DD)" } }
```
Malformed JSON → `400 {"error":"Request body is not valid JSON"}`.
- **Internally:** validate → `prisma.task.create` → `INSERT`.

## 9.6 `PUT /api/tasks/:id`
- **Purpose:** edit title/description/subject/due date (status is changed separately).
- **Body:** same as POST (all required fields must be sent).
- **Success 200:** updated task. **Errors:** `400` (bad id/validation), `404` (no such id).
- **Internally:** validate → `prisma.task.update` → `UPDATE ... WHERE id`; Prisma error `P2025` (record missing) is mapped to 404.

## 9.7 `PATCH /api/tasks/:id/status`
- **Purpose:** mark completed or reopen.
- **Body:** `{ "status": "COMPLETED" }` or `{ "status": "PENDING" }`
- **Success 200:** updated task. **Errors:** `400` `{"error":"Validation failed","details":{"status":"Status must be one of: PENDING, COMPLETED"}}`; `404`.

## 9.8 `DELETE /api/tasks/:id`
- **Success 200:** `{"message":"Task 1 deleted","task":{ ...the deleted task... }}`
- **Errors:** `400` bad id; `404` `{"error":"Task not found"}` (e.g. deleting twice).

## 9.9 Other responses
- Unknown URL → `404 {"error":"Route not found: GET /api/xyz"}`.
- Unexpected bug → `500 {"error":"Internal server error"}` (details only in the server terminal).
- Database unreachable → `503 {"error":"Database is unavailable. Please try again later."}`.

## 9.10 Status codes summary
`200 OK`, `201 Created`, `400 Bad Request` (client sent bad data), `404 Not Found`, `500 Internal Server Error` (server bug), `503 Service Unavailable` (database down).

## 9.11 Postman — ready-to-use requests
**Import** `postman/Student_Task_Manager.postman_collection.json` (Postman → Import). It contains the 14 requests below, using `{{baseUrl}}` = `http://localhost:5000/api`. To create manually: choose method, enter URL, for POST/PUT/PATCH go to **Body → raw → JSON**.

| # | Request | Expect |
|---|---|---|
| 0 | `GET {{baseUrl}}/health` | 200 `database: connected` |
| 1 | `POST {{baseUrl}}/tasks` body below | 201, note the `id` |
| 1b | `POST` with `{"title":"","subject":"","dueDate":"2026-02-31"}` | 400 with `details` |
| 2 | `GET {{baseUrl}}/tasks` | 200 array sorted by due date |
| 2b | `GET {{baseUrl}}/tasks?status=PENDING` | only pending |
| 2c | `GET {{baseUrl}}/tasks?status=COMPLETED&sort=createdAt&order=desc` | only completed, newest first |
| 3 | `GET {{baseUrl}}/tasks/1` | 200 (use a real id) |
| 3b | `GET {{baseUrl}}/tasks/9999` | 404 |
| 4 | `PUT {{baseUrl}}/tasks/1` | 200 edited |
| 5 | `PATCH {{baseUrl}}/tasks/1/status` `{"status":"COMPLETED"}` | 200 |
| 5b | same with `PENDING` | 200 |
| 5c | `{"status":"DONE"}` | 400 |
| 6 | `GET {{baseUrl}}/tasks/stats` | 200 counters |
| 7 | `DELETE {{baseUrl}}/tasks/1` | 200 message |

Sample bodies:
```json
// POST /tasks
{ "title": "Math assignment", "description": "Chapter 4 exercises", "subject": "Mathematics", "dueDate": "2026-11-10" }
// PUT /tasks/1
{ "title": "Math assignment (edited)", "description": "Chapters 4 and 5", "subject": "Mathematics", "dueDate": "2026-11-12" }
// PATCH /tasks/1/status
{ "status": "COMPLETED" }
```
> Task ids keep increasing and are never reused, so use the `id` returned by your POST in later requests.

---

# Section 10: Frontend Explanation

## 10.1 Components and responsibilities
```
App                      ← owns state, calls the API, handles events
├── TaskSummary          ← shows total / pending / completed
├── (error alert)        ← page-level error + Retry button
├── TaskForm             ← add / edit form + validation
├── FilterBar            ← All / Pending / Completed
└── TaskList             ← loading / empty / list
    └── TaskItem (×n)    ← one task, with Mark done / Edit / Delete
```
**Props** are inputs passed from parent to child (like function arguments), e.g. `<TaskItem task={task} onDelete={handleDelete} />`. Children do not change the parent's data; they call functions the parent gave them (`onDelete(task)`), and the parent changes state. This is "data down, events up".

## 10.2 State in `App.jsx`
| State | Holds |
|---|---|
| `tasks` | the array returned by `GET /api/tasks` |
| `stats` | `{total, pending, completed}` from `GET /api/tasks/stats` |
| `filter` | `"ALL"`, `"PENDING"` or `"COMPLETED"` |
| `loading` | `true` while the first/filtered load is in progress |
| `error` | message shown in the red alert |
| `editingTask` | the task being edited, or `null` for "add" mode |

When `setState` is called React re-renders the affected components automatically.

## 10.3 How forms work (`TaskForm.jsx`)
- **Controlled inputs:** each `<input value={values.title} onChange={handleChange}>` shows what is in React state; every keystroke updates state. One `handleChange` serves all fields via `e.target.name`.
- `handleSubmit` calls `e.preventDefault()` (stops the browser's page reload), runs `validate()`, and if valid calls `onSubmit(values)` supplied by `App`.
- **Add vs edit:** `editingTask` decides the initial values, the button text and whether the form is cleared after saving. `App` passes `key={editingTask ? editingTask.id : "new"}` so React creates a *fresh* form (with new initial values) whenever you switch task.
- **Errors:** client-side messages come from `validate()`. If the server rejects the data (400) the `ApiError.details` object is placed into `errors`, so server messages appear under the same fields.
- `saving` disables the button and shows "Saving…" to prevent double submission.

## 10.4 API calls (`api.js`)
One private `request(path, options)` helper wraps `fetch`: adds the JSON header, turns network failure into an understandable message ("Cannot reach the server…"), parses JSON, and throws `ApiError(message, status, details)` for non-2xx responses. Exported functions: `fetchTasks`, `fetchStats`, `createTask`, `updateTask`, `setTaskStatus`, `deleteTask`. Components never use `fetch` directly, so URLs live in one file.

## 10.5 Displaying and updating data
`useEffect` calls `loadData()` on first render and whenever `filter` changes. `loadData` does `Promise.all([fetchTasks(filter), fetchStats()])` then `setTasks`, `setStats`. After **every** successful create/update/toggle/delete, `loadData()` is called again.

## 10.6 Loading, empty, validation and error states
| State | Where | What the user sees |
|---|---|---|
| Loading | `TaskList` (`loading` true) | "Loading tasks…" |
| Empty (no tasks) | `TaskList` | "No tasks yet. Add your first task using the form." |
| Empty (filter) | `TaskList` | "No pending tasks." etc. |
| Field validation | `TaskForm` | red message under the field |
| Server/form error | `TaskForm` alert | e.g. "Validation failed" |
| Page error (server down) | `App` alert | "Cannot reach the server…" + **Retry** |

## 10.7 Staying in sync with the database
The UI never "guesses" the new list. After each change it re-requests the data, so what you see **is** what PostgreSQL contains. (Trade-off: one extra request per action; a more advanced approach updates local state directly **[THEORY ONLY]**.) If you edit the database from elsewhere, press the browser refresh or switch the filter to see it.

---

# Section 11: Complete Code Walkthrough

## 11.1 Server startup (`backend/src/server.js`)
```js
require("dotenv/config");
const app = require("./app");
const prisma = require("./prisma");
const PORT = Number(process.env.PORT) || 5000;
const server = app.listen(PORT, () => { console.log(`Student Task Manager API running at http://localhost:${PORT}`); });
```
- `require("dotenv/config")` reads `backend/.env` into `process.env` **before** anything else (so `prisma.js` can read `DATABASE_URL`).
- `app.listen(PORT)` starts accepting HTTP connections.
- `server.on("error")` prints a friendly message if the port is busy (`EADDRINUSE`).
- `process.on("SIGINT", shutdown)` — when you press Ctrl+C the server stops accepting requests and `prisma.$disconnect()` closes the database connections cleanly.

## 11.2 The Express app (`backend/src/app.js`)
```js
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "100kb" }));
...
app.use("/api/tasks", taskRoutes);
app.use(notFound);
app.use(errorHandler);
```
**Order matters.** A request passes through `app.use` entries from top to bottom: CORS headers → JSON parsing → logger → matching route. If nothing matches, `notFound` runs; if anything throws, `errorHandler` runs (it must be last). The 100 kb limit prevents huge request bodies.

## 11.3 Routes (`routes/taskRoutes.js`)
```js
router.get("/", c.listTasks);
router.get("/stats", c.getStats);   // before "/:id"
router.get("/:id", c.getTask);
router.post("/", c.createTask);
router.put("/:id", c.updateTask);
router.patch("/:id/status", c.updateTaskStatus);
router.delete("/:id", c.deleteTask);
```
Mounted at `/api/tasks`, so `router.get("/:id")` answers `GET /api/tasks/5`. `:id` is a **route parameter** available as `req.params.id`.

## 11.4 Validation (`utils/validation.js`)
```js
function parseDueDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return null;
  return date;
}
```
Line by line: (1) must be a string shaped `dddd-dd-dd`; (2) build a Date at midnight UTC; (3) JavaScript would turn `2026-02-31` into `2026-03-03`, so we convert back to text and compare with the input — if different, the date wasn't real → `null`.
`validateTaskInput(body)` returns `{ errors, data }`: it trims strings, checks required/length rules, and collects *all* errors at once so the user sees every problem in one response. `parseId` accepts only digits within 1…2147483647 (PostgreSQL `integer` range).

## 11.5 Controller logic (`controllers/taskController.js`)
```js
async function createTask(req, res) {
  const { errors, data } = validateTaskInput(req.body);
  if (Object.keys(errors).length > 0)
    throw new HttpError(400, "Validation failed", errors);

  const task = await prisma.task.create({ data });
  res.status(201).json(toJson(task));
}
```
1. `async` — the function can use `await`.
2. Validate; on failure `throw` — Express 5 catches errors thrown in async handlers and passes them to `errorHandler` (no `try/catch` needed).
3. `await prisma.task.create({ data })` — waits for PostgreSQL to insert; returns the new row.
4. `res.status(201).json(...)` — HTTP 201 Created with JSON.

`listTasks` shows filtering/sorting:
```js
const tasks = await prisma.task.findMany({
  where: status ? { status } : {},
  orderBy: [{ [sort]: order }, { id: "asc" }],
});
```
`sort`/`order`/`status` were checked against whitelists immediately before, so only known column names are used.

`toJson(task)` converts the `dueDate` JavaScript Date into `"YYYY-MM-DD"` text.

## 11.6 Prisma client (`backend/src/prisma.js`)
```js
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter, log: process.env.LOG_QUERIES === "true" ? ["query"] : [] });
module.exports = prisma;
```
One client is created once and shared (`require` caches the module). It throws a clear error if `DATABASE_URL` is missing. The adapter is Prisma 7's way to connect to PostgreSQL through the `pg` library.

## 11.7 Error handling (`middleware/errorHandler.js`)
The handler checks, in order: our own `HttpError` (use its status/message/details) → malformed JSON (`entity.parse.failed` → 400) → Prisma `P2025` "record not found" (→ 404) → connection problems (→ 503) → anything else (log it, answer a generic 500 so internal details never leak). Result: every error response has the same JSON shape, which the frontend relies on.

## 11.8 React: loading and saving (`App.jsx`)
```js
const loadData = useCallback(async () => {
  try {
    setError("");
    const [taskData, statsData] = await Promise.all([api.fetchTasks(filter), api.fetchStats()]);
    setTasks(taskData); setStats(statsData);
  } catch (err) { setError(err.message); }
  finally { setLoading(false); }
}, [filter]);

useEffect(() => { setLoading(true); loadData(); }, [loadData]);
```
- `useCallback` keeps the same function until `filter` changes; `useEffect` depends on it, so changing the filter triggers a fresh load automatically.
- `finally` always clears the loading flag, success or failure.

```js
async function handleSave(formData) {
  if (editingTask) { await api.updateTask(editingTask.id, formData); setEditingTask(null); }
  else { await api.createTask(formData); }
  await loadData();
}
```
No `try/catch` here on purpose: errors propagate to `TaskForm.handleSubmit`, which shows them next to the form.

## 11.9 API integration (`api.js`)
```js
try { response = await fetch(`${API_URL}${path}`, { headers: {"Content-Type":"application/json"}, ...options }); }
catch { throw new ApiError("Cannot reach the server. Check that the backend is running on port 5000.", 0); }
...
if (!response.ok) throw new ApiError(data?.error || "Something went wrong", response.status, data?.details);
```
`fetch` only *throws* when the network fails (backend stopped). A 400/404 does not throw, so `response.ok` is checked manually.

## 11.10 Full trace: "Mark done"
`TaskItem` button → `onToggle(task)` → `App.handleToggle` → `api.setTaskStatus(id,"COMPLETED")` → `PATCH /api/tasks/7/status` → router → `updateTaskStatus` → `parseId` → `validateStatus` → `prisma.task.update` → `UPDATE "tasks" SET "status"=$1, "updatedAt"=$2 WHERE "id"=$3` → 200 JSON → `loadData()` → state → re-render: row struck through, counters change.

---

# Section 12: Testing and Verification

Setup: both servers running (§5), browser at http://localhost:5173, optionally `LOG_QUERIES=true` to watch SQL.

| # | Test | Steps | Expected result / how to confirm |
|---|---|---|---|
| 1 | Add valid task | Title "Essay", Subject "English", pick a date, **Add task** | Task appears in list; Total +1; form cleared. Confirm: open `http://localhost:5000/api/tasks` — same task in JSON with a numeric `id`. |
| 2 | Reject invalid data (UI) | Click **Add task** with empty form | Red messages: Title/Subject/Due date required; **no** request appears in backend terminal. |
| 2b | Reject invalid data (API) | Postman 1b (`{"title":"","subject":"","dueDate":"2026-02-31"}`) | Status 400 with `details`. Backend terminal shows `POST /api/tasks -> 400`. |
| 3 | View saved tasks | Reload page (F5) | Same tasks still listed; ordered earliest due date first. |
| 4 | Edit | Click **Edit**, change title, **Save changes** | List shows new title; heading returns to "Add a task". `updatedAt` in API response is newer than `createdAt`. |
| 5 | Complete / reopen | **Mark done** then **Reopen** | Row gets strikethrough + green "Completed"; Pending/Completed counters change, Total unchanged; reverse on reopen. |
| 6 | Delete | **Delete** → OK | Task disappears; Total −1; `GET /api/tasks/<id>` returns 404. |
| 7 | Filter | Click Pending / Completed / All | Only matching tasks; empty message if none. Postman 2b/2c give the same results. |
| 8 | Overdue | Add a task with a past date | Red "Overdue" badge (only while pending). |
| 9 | Persistence | Ctrl+C both servers, start again, reload page | All tasks are still there (stored in PostgreSQL). |
| 10 | Database failure | Stop PostgreSQL (Services → postgresql → Stop), reload app | Red alert "Database is unavailable…" (API returns 503). Start the service again, press **Retry** → tasks return. |
| 11 | API failure | Stop only the backend (Ctrl+C), click a filter | Alert "Cannot reach the server…" ; restart backend, **Retry**. |
| 12 | Automated tests | `cd backend` → `npm test` | `# pass 7`, `# fail 0`. |
| 13 | Frontend build | `cd frontend` → `npm run build` | Ends with `✓ built in …ms`. |
| 14 | Data in PostgreSQL | pgAdmin → Databases → student_task_manager → Schemas → public → Tables → tasks → right-click → View/Edit Data → All Rows (or `SELECT * FROM tasks;`) | Rows match the app. |

---

# Section 13: Troubleshooting

## 13.1 `node` or `npm` is "not recognized"
Cause: Node not installed or PowerShell opened before installing. Fix: install Node LTS (§4.1), **close all PowerShell windows and open a new one**, run `node -v`. If still failing, reboot. Check `echo $env:Path` contains `C:\Program Files\nodejs\`.

## 13.2 "npm.ps1 cannot be loaded because running scripts is disabled"
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

## 13.3 PostgreSQL service not running
Symptoms: health shows `unreachable`; Prisma error `P1001: Can't reach database server`. Fix: Windows key → **Services** → **postgresql-x64-…** → right-click **Start**. Or PowerShell **as Administrator**: `Get-Service *postgres*` then `Start-Service <name shown>`.

## 13.4 Wrong credentials (`P1000` / "password authentication failed")
Check `DATABASE_URL` in `backend\.env`: user `postgres`, correct password, `localhost`, port `5432`. Test the password:
```powershell
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -h localhost -c "SELECT 1;"
```
Special characters in the password must be URL-encoded (`@` → `%40`). Restart the backend after editing `.env`.

## 13.5 Database not found (`P1003` / "database ... does not exist")
Create it (§4.3) — the name in `DATABASE_URL` must match exactly: `student_task_manager`.

## 13.6 Prisma problems
- **"DATABASE_URL is not set"** or `Environment variable not found` → `.env` missing/in wrong folder. It must be `backend\.env` (not `.env.example`, not `.env.txt`). Check: `dir backend -Force`. Notepad may save as `.env.txt` — choose "All files" or use `Copy-Item` as shown.
- **`@prisma/client did not initialize yet` / `Cannot find module '.prisma/client'`** → run `npx prisma generate` in `backend`.
- **`prisma migrate deploy` fails to download engines (network/antivirus/proxy)** → retry on another network; confirm internet access; then `npx prisma migrate deploy` again.
- **"The table `public.tasks` does not exist"** → migration not applied: `npx prisma migrate deploy`.
- **"type TaskStatus already exists" / migration conflicts** → you applied SQL by hand earlier. Easiest reset for this practice project (**deletes all tasks**): `npx prisma migrate reset --force`, or drop and recreate the database in pgAdmin and run `migrate deploy`.
- **After editing `schema.prisma`** run `npx prisma generate` and create a migration with `npx prisma migrate dev --name describe_change`.
- *Note:* the migration SQL was written to match Prisma's format and was tested by applying it directly with `psql` in a Linux environment, but `prisma migrate deploy` itself has not been run by the author of this guide — if it reports an unexpected checksum/drift message, tell your instructor/assistant the exact text.

## 13.7 Port already in use (`EADDRINUSE`)
Find and stop the process (PowerShell):
```powershell
netstat -ano | findstr :5000
taskkill /PID <number from last column> /F
```
Or change `PORT` in `backend\.env` **and** `VITE_API_URL` for the frontend (create `frontend\.env` with `VITE_API_URL=http://localhost:5001/api`) and restart both. For port 5173 conflicts, close the other Vite window (Vite is set to fail rather than silently change port, because the backend CORS expects 5173).

## 13.8 CORS error in browser console ("blocked by CORS policy")
The browser address must exactly equal `CORS_ORIGIN` (`http://localhost:5173`, not `127.0.0.1`). Fix `backend\.env`, **restart the backend**.

## 13.9 Frontend cannot contact backend ("Cannot reach the server…")
1. Is the backend terminal running and showing "API running"?
2. Open http://localhost:5000/api/health directly.
3. Does `VITE_API_URL` (if you created `frontend\.env`) match the backend port? Restart Vite after changing it.
4. Firewall prompt on first run: choose **Allow**.

## 13.10 Missing dependencies (`Cannot find module 'express'` / `'vite' is not recognized`)
You skipped `npm install` in that folder (backend and frontend each need their own): `cd` into the folder → `npm install`.

## 13.11 Invalid environment variables
- Quotes: keep the `"` around `DATABASE_URL` exactly as in `.env.example`; no spaces around `=`.
- `PORT` must be a number.
- After **any** `.env` change, restart the backend (Ctrl+C, `npm run dev`).

## 13.12 Blank page / React errors
Open browser DevTools (F12) → **Console** tab and read the first red message. Make sure you started `npm run dev` in `frontend` and opened `http://localhost:5173` (not the file directly).

---

# Section 14: Internal Assessment Demonstration

**Total time: ~8–10 minutes.** Prepare beforehand: PostgreSQL service running, both servers started, browser open at `localhost:5173`, Postman imported, pgAdmin open on the `tasks` table, VS Code opened on the project folder (optional), `LOG_QUERIES=true` for the SQL demo.

| Step | Time | What to do / say |
|---|---|---|
| 1 | 1 min | **Introduce** (use the one-minute pitch, §16.1). Show the architecture diagram (§7.1). |
| 2 | 1 min | **Open the app.** Point to the summary, form, list, filter. "Every item here comes from PostgreSQL through the API." |
| 3 | 2 min | **Features:** add a task (first click Add with an empty form to show validation) → add 2–3 tasks → note sorting by due date → Edit one → Mark done (counters change) → filter Pending/Completed → Delete one. |
| 4 | 1 min | **Backend proof:** open `localhost:5000/api/tasks` in a tab: same data as JSON. Show the backend terminal logging `POST /api/tasks -> 201`. |
| 5 | 2 min | **Postman:** show `GET /tasks`, `POST /tasks` (201), the invalid POST (400 with details), `PATCH .../status`, `GET /tasks/9999` (404). Mention status codes. |
| 6 | 1 min | **Database proof:** pgAdmin → `tasks` → View Data (or `SELECT * FROM tasks;`). Show the new row. Show the SQL Prisma printed in the backend terminal. |
| 7 | 1 min | **Persistence:** stop and restart the backend; refresh the browser — data remains. |
| 8 | 1 min | **Integration summary:** "Backend: Express routes/controllers; Database: PostgreSQL + Prisma schema/migration; Full-stack: React talks to Express which talks to the DB." |

**Which files to open when asked**
- *Backend:* `src/server.js` → `app.js` → `routes/taskRoutes.js` → `controllers/taskController.js` → `middleware/errorHandler.js`, `utils/validation.js`.
- *Database:* `prisma/schema.prisma`, `prisma/migrations/.../migration.sql`, `src/prisma.js`; pgAdmin table.
- *Frontend:* `src/App.jsx`, `src/api.js`, `components/TaskForm.jsx`.

**Showing the three subjects are integrated:** create a task in the UI → show the JSON in Postman → show the row in pgAdmin → show the SQL line in the terminal. One action, visible at every layer.

---

# Section 15: Viva Preparation Handbook

Format for each question: **Say aloud** (short answer) • **Understand** (simple explanation) • **In this project** (where to point). Items marked **[THEORY ONLY]** are not implemented in the code — say clearly that they are future scope.

## 15.1 Project purpose, objectives, scope, limitations

**Q1. What is your project and what problem does it solve?**
- **Say aloud:** It is a full-stack Student Task Manager where students store assignments with subject and due date, track pending/completed status and see statistics.
- **Understand:** Deadlines from many subjects get forgotten; one persistent place fixes that.
- **In this project:** React UI → Express API → Prisma → PostgreSQL.

**Q2. Why did you choose this project?**
- **Say aloud:** It is simple to explain but touches every layer: REST API, relational database with migrations, and a React frontend.
- **Understand:** A bigger project would hide the core concepts; a small one lets me explain every line.

**Q3. What are the objectives?**
- **Say aloud:** CRUD operations, layered backend, persistent relational storage with Prisma migrations, React UI consuming the API, validation and error handling.

**Q4. What are the limitations?**
- **Say aloud:** No login so all users share one list, no pagination, no real-database automated tests, single table, no deployment, no explicit transactions.
- **Understand:** I kept scope small on purpose; these are future improvements (see 15.17).

**Q5. Which of the three subjects does it cover and how?**
- **Say aloud:** Backend: Express routes/controllers/middleware. Database: PostgreSQL schema, constraints, indexes, Prisma migration and queries. Full-stack: React components calling the API and updating from database data.
- **In this project:** §2 table.

## 15.2 Frontend vs backend, API, three-tier

**Q6. Difference between frontend and backend?**
- **Say aloud:** The frontend runs in the browser and handles what the user sees; the backend runs on a server, applies rules and talks to the database.
- **Understand:** The browser is not trusted — anyone can send fake requests — so rules must live in the backend.
- **In this project:** `frontend/` (port 5173) vs `backend/` (port 5000).

**Q7. What is an API?**
- **Say aloud:** An Application Programming Interface — a defined set of URLs and message formats through which one program asks another to do things.
- **In this project:** `/api/tasks...` endpoints returning JSON.

**Q8. Difference between database, backend, frontend and API?**
- **Say aloud:** Database stores data; backend contains logic; frontend is the interface; the API is the agreed language between frontend and backend.

**Q9. Why doesn't React talk directly to PostgreSQL?**
- **Say aloud:** Browser code is public and unsafe; credentials and validation must stay on the server.
- **Understand:** If the password were in React code, every visitor could read it.

## 15.3 Node.js and Express

**Q10. What is Node.js?**
- **Say aloud:** A runtime that executes JavaScript outside the browser, built on Chrome's V8 engine.
- **Understand:** Lets us use one language for frontend and backend.

**Q11. Why is Node.js "non-blocking"?**
- **Say aloud:** While waiting for slow I/O such as the database, the event loop serves other requests instead of waiting.
- **In this project:** `await prisma.task.findMany()` doesn't block other incoming requests.

**Q12. What is Express and why use it?**
- **Say aloud:** A minimal web framework for Node that gives routing and middleware so we don't hand-code HTTP handling.

**Q13. What is npm / package.json / package-lock.json / node_modules?**
- **Say aloud:** npm installs libraries; `package.json` lists them and scripts; the lock file pins exact versions; `node_modules` holds downloaded code and is not committed to Git.

**Q14. What does `app.listen` do?**
- **Say aloud:** Binds the app to a port and starts accepting HTTP requests.
- **In this project:** `server.js`, port 5000.

**Q15. Why separate `app.js` and `server.js`?**
- **Say aloud:** `app.js` builds the app; `server.js` starts it. This lets tests import the app without opening the real port.
- **In this project:** `tests/validation.test.js` uses `app.listen(0)` (random free port).

## 15.4 HTTP, REST, JSON, CRUD, status codes

**Q16. What is HTTP?** 
- **Say aloud:** The request/response protocol of the web: client sends method + URL + headers + optional body; server replies with status + headers + body.

**Q17. What is REST?**
- **Say aloud:** An API style where URLs name resources (`/tasks/5`) and HTTP methods express the action (GET read, POST create, PUT replace/edit, PATCH partial update, DELETE remove).

**Q18. PUT vs PATCH?**
- **Say aloud:** PUT sends the whole editable resource; PATCH sends only the part that changes.
- **In this project:** `PUT /tasks/:id` edits title/description/subject/date; `PATCH /tasks/:id/status` changes only status.

**Q19. GET vs POST?**
- **Say aloud:** GET reads and has no body and no side effects; POST sends data in a body to create something.

**Q20. What is JSON and why used?**
- **Say aloud:** JavaScript Object Notation — a lightweight text format of key/value data readable by every language.
- **In this project:** request bodies and all responses.

**Q21. What is CRUD?**
- **Say aloud:** Create, Read, Update, Delete — the four basic data operations, mapped to INSERT, SELECT, UPDATE, DELETE.

**Q22. Explain the status codes you used.**
- **Say aloud:** 200 OK, 201 Created (after POST), 400 Bad Request (invalid input), 404 Not Found, 500 Internal Server Error (our bug), 503 Service Unavailable (database down).
- **Follow-up — 400 vs 500?** 400 = client's fault (bad data); 500 = server's fault.

**Q23. Why is the route `/stats` placed before `/:id`?**
- **Say aloud:** Express matches routes in order; otherwise `stats` would be interpreted as an id.

## 15.5 Synchronous vs asynchronous, Promises, async/await

**Q24. Synchronous vs asynchronous?**
- **Say aloud:** Synchronous code runs line by line and blocks until each step finishes; asynchronous code starts a slow operation and continues, handling the result later.

**Q25. What is a Promise?**
- **Say aloud:** An object representing a value that will be available later — pending, fulfilled or rejected.
- **In this project:** `fetch(...)` and `prisma.task.create(...)` return Promises.

**Q26. What is async/await?**
- **Say aloud:** `async` marks a function that returns a Promise; `await` pauses *that function* until the Promise settles, making async code look sequential.
- **Understand:** It pauses only that function, not the whole server.

**Q27. How do you handle errors in async code?**
- **Say aloud:** In the backend, controllers `throw`; Express 5 forwards the rejected promise to the central error handler. In React, `try/catch` around `await`.
- **Follow-up — would this work in Express 4?** No; Express 4 needs `try/catch` + `next(err)` or a wrapper.

**Q28. What is `Promise.all` and where did you use it?**
- **Say aloud:** Runs several promises concurrently and waits for all.
- **In this project:** `App.loadData` fetches tasks and stats together; `getStats` runs two counts together.

## 15.6 Routes, controllers, middleware, error handling

**Q29. What is middleware?**
- **Say aloud:** A function that runs between the request and the final handler and can modify the request/response or stop the chain.
- **In this project:** `cors`, `express.json`, request logger, `notFound`, `errorHandler`.

**Q30. Why routes and controllers separately?**
- **Say aloud:** Routes say *which URL goes where*; controllers say *what to do*. Smaller files, easier to find and test.

**Q31. How does your centralized error handling work?**
- **Say aloud:** Controllers throw an `HttpError` (or Prisma/other errors bubble up); a single 4-argument middleware converts them into JSON with the right status.
- **Understand:** Avoids repeating `res.status(...).json(...)` everywhere and gives one consistent error format.

**Q32. How does Express know a function is an error handler?**
- **Say aloud:** It has four parameters `(err, req, res, next)`.

**Q33. What does `express.json()` do?**
- **Say aloud:** Reads the request body and, if it is JSON, puts the parsed object in `req.body`. Invalid JSON triggers an error that we convert to 400.

**Q34. What is the difference between `req.params`, `req.query`, `req.body`?**
- **Say aloud:** params = parts of the path (`/tasks/5` → id 5); query = after `?` (`?status=PENDING`); body = data sent in the request payload.

## 15.7 React: components, state, props, forms, API requests

**Q35. What is a React component?**
- **Say aloud:** A reusable function returning UI (JSX).
- **In this project:** `TaskForm`, `TaskItem`, etc.

**Q36. State vs props?**
- **Say aloud:** State is data a component owns and can change; props are read-only inputs from the parent.

**Q37. What is `useState`?**
- **Say aloud:** A hook that stores a value and re-renders the component when it changes.

**Q38. What is `useEffect` and when does it run?**
- **Say aloud:** Runs side effects (like fetching data) after render; its dependency list controls when it re-runs.
- **In this project:** loads tasks on first render and whenever the filter changes.

**Q39. What is a controlled component?**
- **Say aloud:** A form input whose value comes from React state and is updated by `onChange`.

**Q40. Why `e.preventDefault()`?**
- **Say aloud:** Stops the browser's default form submission that would reload the page.

**Q41. How does React talk to the backend?**
- **Say aloud:** Using `fetch` in `api.js` to call the Express endpoints with JSON.

**Q42. Why `key` in lists and the form?**
- **Say aloud:** `key` lets React identify items. For the form, changing `key` forces React to create a fresh form so initial values reset when I switch from "add" to "edit".

**Q43. How does the UI stay in sync with the database?**
- **Say aloud:** After every change it re-fetches from the API (`loadData`), so the screen always reflects stored data.

## 15.8 PostgreSQL and relational concepts

**Q44. What is a relational database?**
- **Say aloud:** Stores data in tables of rows and columns with defined types and constraints; queried with SQL.

**Q45. Why PostgreSQL rather than a JSON file or an array?**
- **Say aloud:** Persistence, constraints, indexing, safe concurrent access and real querying; an array in memory would be lost on restart.

**Q46. What is a primary key?**
- **Say aloud:** A column that uniquely identifies each row; cannot be NULL or duplicated.
- **In this project:** `id SERIAL PRIMARY KEY`.

**Q47. What constraints did you use?**
- **Say aloud:** PRIMARY KEY, NOT NULL, DEFAULT values, VARCHAR length limits and an ENUM for status.

**Q48. Why an enum for status?**
- **Say aloud:** The database itself rejects any value other than PENDING/COMPLETED.

**Q49. Why `DATE` for dueDate and `TIMESTAMP` for createdAt?**
- **Say aloud:** A due date has no time of day, so DATE avoids time-zone shifts; created/updated times need precision.

**Q50. What is an index and why did you add two?**
- **Say aloud:** A lookup structure that speeds up searches/sorts on a column; I indexed `status` (filter) and `dueDate` (sort).
- **Honest follow-up:** With few rows there is no visible gain; it matters for large tables. Indexes cost extra storage/write time.

**Q51. Is the table normalised? What is a foreign key?**
- **Say aloud:** One table is enough here. A foreign key links a column to another table's primary key. If I made a `subjects` table, `tasks.subjectId` would be a foreign key. **[THEORY ONLY — not implemented]**

## 15.9 Prisma, schema, migrations, client

**Q52. What is Prisma / an ORM?**
- **Say aloud:** An Object-Relational Mapper that lets me use JavaScript objects and methods instead of writing SQL by hand, while still running SQL on the database.

**Q53. What is `schema.prisma`?**
- **Say aloud:** The file that defines the data model (and generator/datasource). Prisma generates the client and migrations from it.

**Q54. What does `prisma generate` do?**
- **Say aloud:** Creates the Prisma Client code for my models so I can call `prisma.task.*`.

**Q55. What is a migration?**
- **Say aloud:** A versioned SQL file that changes the database structure; applying migrations makes any database match the schema.
- **In this project:** `migrations/20261022000000_init/migration.sql`.

**Q56. `migrate deploy` vs `migrate dev`?**
- **Say aloud:** `deploy` applies existing migrations; `dev` creates a new migration from schema changes and applies it (development only).

**Q57. How does Prisma convert code to SQL?**
- **Say aloud:** The generated client turns method calls into a query plan and sends parameterised SQL through the PostgreSQL driver.
- **In this project:** set `LOG_QUERIES=true` and show `SELECT ... WHERE status = $1 ORDER BY dueDate ASC`.

**Q58. Prisma vs raw SQL?**
- **Say aloud:** Prisma gives safer, shorter, auto-completing code and migrations; raw SQL gives full control. I use Prisma for everything except a constant `SELECT 1` health check.

**Q59. What is the driver adapter?**
- **Say aloud:** In Prisma 7, the library (`pg` via `@prisma/adapter-pg`) that actually connects to PostgreSQL.

## 15.10 Queries, persistence, filtering, sorting, integrity

**Q60. How is filtering done?**
- **Say aloud:** `findMany({ where:{status} })` becomes SQL `WHERE`, so PostgreSQL does the filtering.

**Q61. How is sorting done?**
- **Say aloud:** `orderBy` becomes `ORDER BY`; default is due date ascending, with `id` as a tie-breaker.

**Q62. How do you get the counts?**
- **Say aloud:** `prisma.task.count` for pending and completed; total is their sum. They run in parallel with `Promise.all`.
- **Honest follow-up:** one `groupBy` query would be a single round trip; two counts are simpler to read.

**Q63. What happens when I update a task that doesn't exist?**
- **Say aloud:** Prisma throws error code `P2025`; my error handler returns 404.

**Q64. How is data integrity ensured?**
- **Say aloud:** Validation in React, validation in Express, and constraints in the database.

**Q65. Why does data survive a restart?**
- **Say aloud:** It is written to PostgreSQL's disk storage, separate from the Node process.

## 15.11 Integration

**Q66. Explain the complete flow of adding a task.**
- **Say aloud:** Form validates → `fetch POST /api/tasks` → CORS check → `express.json` → route → controller validates → `prisma.task.create` → SQL INSERT → PostgreSQL stores row → controller returns 201 JSON → React reloads list and stats → UI updates.

**Q67. Where does each technology sit?**
- **Say aloud:** React in browser; Express in Node server; Prisma inside the Node process as a library; PostgreSQL as a separate server.

**Q68. Is Prisma a database?**
- **Say aloud:** No. It's a library in the backend that talks to the database.

## 15.12 Validation, security, CORS, environment variables

**Q69. Why validate on both frontend and backend?**
- **Say aloud:** Frontend validation gives instant feedback; backend validation is the real protection because requests can bypass the browser (e.g. Postman).

**Q70. What is SQL injection and how is it prevented here?**
- **Say aloud:** Attacker text altering an SQL command. Prisma sends values as parameters, never concatenated into SQL; the id is also verified to be a plain integer; sort/status values are whitelisted.
- **In this project:** unit test with `"1; DROP TABLE tasks"` → rejected.

**Q71. What is CORS?**
- **Say aloud:** A browser security rule blocking a page from calling a different origin (different port counts) unless the server allows it with CORS headers.
- **In this project:** frontend :5173 calls backend :5000, so `cors({origin: "http://localhost:5173"})`.
- **Follow-up — does CORS protect the API from attackers?** No, only browsers enforce it; Postman/curl ignore it. Real protection needs authentication **[THEORY ONLY]**.

**Q72. What are environment variables and why `.env`?**
- **Say aloud:** Configuration outside the code (database URL/password, port). `.env` is not committed; `.env.example` shows the format.

**Q73. What security is missing?**
- **Say aloud:** Authentication/authorization, HTTPS, rate limiting, Helmet headers, and a least-privilege DB user. **[THEORY ONLY]**

**Q74. How do you avoid leaking internals in errors?**
- **Say aloud:** Unexpected errors are logged in the server terminal while the client receives only "Internal server error".

## 15.13 Testing, debugging, troubleshooting

**Q75. How did you test?**
- **Say aloud:** Postman for the API, a manual UI checklist, and automated unit tests for validation plus API rejection (`npm test`, 7 tests).
- **Honest follow-up:** There are no automated tests that use the real database.

**Q76. How would you debug "frontend shows no data"?**
- **Say aloud:** Check the browser console/Network tab → call the API URL directly → check backend terminal logs → check `/api/health` → check PostgreSQL service and `DATABASE_URL`.

**Q77. How do you see the SQL being run?**
- **Say aloud:** Set `LOG_QUERIES=true` and restart the backend.

## 15.14 Git, GitHub, organisation

**Q78. What is Git vs GitHub?**
- **Say aloud:** Git is local version control; GitHub is a website hosting Git repositories for sharing/collaboration.

**Q79. What goes in `.gitignore` and why?**
- **Say aloud:** `node_modules/`, `.env`, `dist/`, logs — generated or secret files that shouldn't be uploaded.

**Q80. How is the project organised?**
- **Say aloud:** Separate `frontend` and `backend` folders with their own `package.json`; backend split into routes/controllers/middleware/utils; database definition in `prisma/`.

**Q81. How do I push this to GitHub?** *(commands)*
```powershell
cd C:\Projects\student-task-manager
git init
git add .
git commit -m "Student Task Manager"
git branch -M main
git remote add origin https://github.com/<your-username>/student-task-manager.git
git push -u origin main
```
Check that `.env` is **not** listed by `git status` before committing.

## 15.15 Scalability, concurrency, transactions, caching, reliability (conceptual)

**Q82. How does the app handle many users at once?**
- **Say aloud:** Node's event loop handles many requests concurrently while waiting for I/O, and the `pg` library pools database connections. It is only tested for local use; I have not load-tested it.

**Q83. What is a transaction? Did you use one?**
- **Say aloud:** A group of operations that all succeed or all fail. I did **not** use an explicit transaction because each operation is a single statement, already atomic. **[THEORY ONLY]**
- **Example for follow-up:** moving a task and updating a counter table together would need `prisma.$transaction`.

**Q84. What are ACID properties?**
- **Say aloud:** Atomicity (all or nothing), Consistency (rules always hold), Isolation (concurrent transactions don't interfere), Durability (committed data survives crashes). PostgreSQL provides them.

**Q85. What happens if two users edit the same task simultaneously?**
- **Say aloud:** The last save overwrites the first (last-write-wins). Optimistic locking with a version field would detect it. **[THEORY ONLY]**

**Q86. What is caching? Did you use it?**
- **Say aloud:** Storing results temporarily to avoid repeating work (e.g. Redis). Not implemented; the data is small and must always be current. **[THEORY ONLY]**

**Q87. How would you scale it?**
- **Say aloud:** Add pagination, DB indexes (partly done), run multiple backend instances behind a load balancer, cache reads, move to a managed database. **[THEORY ONLY]**

**Q88. How do you make it reliable?**
- **Say aloud:** Central error handling, 503 on database failure with recovery without restarting the backend (tested), graceful shutdown, health endpoint. Not yet: retries, monitoring, backups.

## 15.16 Challenging follow-ups

**Q89. Why does `fetch` not throw on a 404?**
- **Say aloud:** `fetch` only rejects on network failure; HTTP error statuses are normal responses, so I check `response.ok`.

**Q90. Why return `dueDate` as `YYYY-MM-DD` instead of a full timestamp?**
- **Say aloud:** The column is a DATE, and a plain date string avoids time-zone shifts (a UTC midnight could show as the previous day in some time zones).

**Q91. Why trim and why `description` default empty string?**
- **Say aloud:** Trimming prevents whitespace-only titles; empty string avoids NULL checks in the UI.

**Q92. Why is Prisma Client created only once?**
- **Say aloud:** Each client holds a connection pool; creating many would waste connections. `require` caches `prisma.js`.

**Q93. What would change if the DB were MySQL?**
- **Say aloud:** Change the provider/adapter and `DATABASE_URL`, regenerate and re-create migrations; controllers stay the same — that's the ORM benefit. (Prisma enums/`@db` types differ slightly.)

**Q94. Why `PUT` returns 404 and not create when missing?**
- **Say aloud:** My PUT means "edit existing"; creating is done only through POST.

**Q95. What if the frontend and backend were on the same origin?**
- **Say aloud:** CORS wouldn't be needed — e.g. serving the built React files from Express **[THEORY ONLY — not done]**.

## 15.17 Limitations and future scope
Authentication (users own their tasks, `userId` foreign key), separate `Subject` table, pagination/search, due-date reminders/emails, edit conflict detection, `prisma.$transaction` where multi-step writes appear, integration tests against a test database, Docker/deployment, rate limiting and Helmet, TypeScript. **None of these are implemented.**

---

# Section 16: Quick Revision Sheet

## 16.1 One-minute introduction (say aloud)
"My project is a **Student Task Manager**, a full-stack web application that helps students record assignments with a title, description, subject and due date, mark them pending or completed, edit or delete them, and see totals. The frontend is built with **React and Vite**. It sends JSON requests to a **Node.js and Express** REST API. The API validates the data and uses **Prisma ORM** to store it in a **PostgreSQL** database, so the data is permanent. It covers all three subjects: backend architecture with routes, controllers, middleware and error handling; database engineering with a schema, constraints, indexes and migrations; and full-stack integration where the React UI always shows data from the real database."

## 16.2 Two-minute architecture and request flow (say aloud)
"There are three tiers. The **browser** runs React on port 5173. The **Express server** runs on port 5000 and exposes endpoints under `/api/tasks`. **PostgreSQL** runs on port 5432 and stores a `tasks` table. When I click *Add task*, React validates the form and sends `POST /api/tasks` with JSON using `fetch`. Express first applies CORS and parses the JSON, then the router sends the request to the `createTask` controller. The controller validates the input; if it is wrong it throws a 400 error that the central error handler converts to JSON. If it is valid, the controller `await`s `prisma.task.create`. Prisma generates a parameterised `INSERT` statement and sends it through the pg driver to PostgreSQL, which stores the row and returns it. The controller replies with status 201 and the saved task as JSON. React then re-fetches the list and counters, updates its state and re-renders, so what's on screen is exactly what is in the database. Editing uses PUT, completing uses PATCH, deleting uses DELETE; the flow is the same."

## 16.3 How each subject is covered
- **Backend Development:** Express server, REST CRUD endpoints, HTTP methods/status codes, JSON, async/await, validation, middleware, centralized error handling, routes/controllers separation, CORS, environment variables, Postman collection.
- **Database Engineering:** PostgreSQL `tasks` table with primary key, types, NOT NULL, defaults, enum, indexes; Prisma schema, generated client, migration; CRUD, filtering and sorting by queries; parameterised (safe) access. Transactions explained as theory.
- **Full-Stack:** React components (form, list, item, summary, filter), state and effects, `fetch` API layer, loading/empty/error/validation states, refresh from DB after every change, CORS, Git-ready structure and README.

## 16.4 Important files
| File | Role |
|---|---|
| `backend/src/server.js` | Starts server, graceful shutdown |
| `backend/src/app.js` | Middleware, health route, mounts routes, error handlers |
| `backend/src/routes/taskRoutes.js` | URL → controller map |
| `backend/src/controllers/taskController.js` | Endpoint logic using Prisma |
| `backend/src/utils/validation.js` | Validation rules |
| `backend/src/middleware/errorHandler.js` | Errors → JSON |
| `backend/src/prisma.js` | Prisma client + PostgreSQL adapter |
| `backend/prisma/schema.prisma` | Data model |
| `backend/prisma/migrations/.../migration.sql` | Creates table |
| `backend/.env` | DATABASE_URL, PORT, CORS_ORIGIN |
| `frontend/src/App.jsx` | State + data loading + handlers |
| `frontend/src/api.js` | All `fetch` calls |
| `frontend/src/components/TaskForm.jsx` | Add/edit form + validation |

## 16.5 Important endpoints
`GET /api/health` • `GET /api/tasks` (`?status=&sort=&order=`) • `GET /api/tasks/stats` • `GET /api/tasks/:id` • `POST /api/tasks` • `PUT /api/tasks/:id` • `PATCH /api/tasks/:id/status` • `DELETE /api/tasks/:id`

## 16.6 Twenty high-priority viva questions (short answers)
1. **What does your project do?** Manages student assignments with persistent storage and statistics.
2. **Tech stack?** React + Vite, Node.js + Express, PostgreSQL, Prisma, plain CSS, Postman.
3. **What is REST?** URLs as resources + HTTP methods as actions.
4. **Which HTTP methods did you use?** GET, POST, PUT, PATCH, DELETE.
5. **What is CRUD?** Create, Read, Update, Delete = INSERT, SELECT, UPDATE, DELETE.
6. **What is middleware?** Functions between request and handler (cors, express.json, logger, error handler).
7. **Why routes and controllers?** Routes map URLs, controllers contain logic — separation of concerns.
8. **What is async/await?** Syntax to wait for Promises without blocking the server.
9. **How is validation done?** Frontend for UX; backend `validation.js` is authoritative; DB constraints last.
10. **How are errors handled?** `HttpError` + one central handler returning consistent JSON and status codes.
11. **What is Prisma?** ORM: models → generated client → SQL; also manages migrations.
12. **What is a migration?** Versioned SQL change applied by `prisma migrate deploy`.
13. **Primary key here?** `id SERIAL` auto-increment.
14. **How are filter/sort done?** Prisma `where`/`orderBy` → SQL `WHERE`/`ORDER BY` in PostgreSQL.
15. **How do you prevent SQL injection?** Parameterised queries via Prisma, id check, whitelisted sort/status values.
16. **What is CORS and why needed?** Browser rule for cross-origin calls; frontend :5173 → backend :5000 needs permission.
17. **State vs props?** State is owned and changeable; props are read-only inputs from the parent.
18. **How does the UI stay updated?** Re-fetch from the API after every change (`loadData`).
19. **What isn't implemented?** Authentication, pagination, explicit transactions, caching, deployment, DB integration tests.
20. **What happens if the database stops?** API returns 503 with a clear message; the UI shows an alert + Retry; it works again when PostgreSQL restarts (tested).

## 16.7 Final checklist before the assessment
- [ ] PostgreSQL service is **Running** (Windows Services).
- [ ] `backend\.env` exists with the correct password; `http://localhost:5000/api/health` shows `connected`.
- [ ] Backend terminal: `npm run dev`; frontend terminal: `npm run dev`; app opens at `localhost:5173`.
- [ ] You added a few sample tasks beforehand (but practise also starting from an empty list).
- [ ] Postman collection imported; `baseUrl` variable correct; you know which `id` to use.
- [ ] pgAdmin open on `tasks` table (or `psql` ready).
- [ ] `LOG_QUERIES=true` if you want to show SQL (restart backend after changing).
- [ ] You can open and explain: `taskRoutes.js`, `taskController.js`, `validation.js`, `errorHandler.js`, `schema.prisma`, `App.jsx`, `api.js`, `TaskForm.jsx`.
- [ ] You can draw the architecture diagram from memory.
- [ ] You know what is **theory only** (auth, transactions, caching, pagination) and say so honestly.
- [ ] Laptop charged, internet not required (everything runs locally), backup: screenshots of a working run.
- [ ] Practise the 1-minute and 2-minute speeches aloud.

*End of guide.*
