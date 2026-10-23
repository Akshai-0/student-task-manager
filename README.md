# Student Task Manager

A simple full-stack web app for managing academic assignments.

**Stack:** React (Vite) • Node.js + Express • PostgreSQL • Prisma ORM • plain CSS

**Features:** add / edit / delete tasks (title, description, subject, due date) • mark pending or completed • total / pending / completed counters • tasks sorted by due date • filter by status • overdue highlighting • validation and readable errors.

```
React (localhost:5173)  --HTTP/JSON-->  Express API (localhost:5000)  --Prisma-->  PostgreSQL (localhost:5432)
```

> The full beginner-friendly manual (Windows setup, architecture, API reference, troubleshooting, demo plan and viva Q&A) is in **Student_Task_Manager_Complete_Guide.md**.

## Prerequisites
- Node.js 22 or newer (LTS) — https://nodejs.org
- PostgreSQL 16 or newer — https://www.postgresql.org/download/
- (optional) Postman — https://www.postman.com/downloads/

## Quick start (PowerShell)

1. Create an empty database called `student_task_manager` (pgAdmin, or
   `psql -U postgres -c "CREATE DATABASE student_task_manager;"`).

2. Backend (terminal 1):
```powershell
cd backend
Copy-Item .env.example .env      # then edit .env and put your PostgreSQL password in DATABASE_URL
npm install
npx prisma generate              # generates the Prisma client
npx prisma migrate deploy        # creates the tasks table
npm run dev                      # API on http://localhost:5000
```

3. Frontend (terminal 2):
```powershell
cd frontend
npm install
npm run dev                      # app on http://localhost:5173
```

4. Open http://localhost:5173. Check the database connection at http://localhost:5000/api/health.

## API summary
| Method | URL | Purpose |
|---|---|---|
| GET | `/api/health` | Server + database check |
| GET | `/api/tasks?status=&sort=&order=` | List tasks (filter/sort) |
| GET | `/api/tasks/stats` | Total / pending / completed |
| GET | `/api/tasks/:id` | One task |
| POST | `/api/tasks` | Create |
| PUT | `/api/tasks/:id` | Edit |
| PATCH | `/api/tasks/:id/status` | Mark `PENDING` / `COMPLETED` |
| DELETE | `/api/tasks/:id` | Delete |

Import `postman/Student_Task_Manager.postman_collection.json` into Postman to try them.

## Scripts
| Folder | Command | Meaning |
|---|---|---|
| backend | `npm run dev` | start API with auto-restart |
| backend | `npm start` | start API |
| backend | `npm test` | run automated tests (no database needed) |
| frontend | `npm run dev` | start React dev server |
| frontend | `npm run build` | production build |

## Project structure
```
backend/   src/ (server, app, routes, controllers, middleware, utils, prisma client)
           prisma/ (schema.prisma, migrations/)   tests/
frontend/  src/ (App.jsx, api.js, components/, styles.css)
postman/   Postman collection
```

## Security note
Never commit `backend/.env` (it holds your database password). Only `.env.example` is in Git.
