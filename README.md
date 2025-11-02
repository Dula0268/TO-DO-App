# To-Do Application

## Structure

## Quick start (recommended)
Follow these steps to run the app locally (PowerShell examples provided):
# TO-DO App

A simple full-stack To-Do application with a Next.js (frontend) client and a Spring Boot (Java) backend.

This repository contains a small, pragmatic example for building a secure CRUD app with JWT authentication, a Postgres-backed backend, and a modern React/Next frontend.

---

## 📁 Project Structure

```
/TO-DO-App
├── backend        # Spring Boot backend (Java, Maven, Spring Security, Flyway)
├── frontend       # Next.js frontend (TypeScript, Axios, Tailwind)
├── db             # example SQL files and schema
├── README.md      # (this file)
```

---

## 🚀 Getting started (developer flow)

You can run the backend and frontend separately. The frontend talks to the backend API (by default http://localhost:8080).

Prerequisites

* Java 21
* Maven (or use the included Maven wrapper)
* Node.js (v18+ recommended)
* PostgreSQL (or run via Docker)

Quick start (PowerShell)

```powershell
# start backend (from /backend)
cd backend
# use the provided helper script which loads backend/.env and runs the app
powershell -ExecutionPolicy Bypass -File .\start-backend.ps1

# in a separate terminal: start frontend (from /frontend)
cd frontend
npm install
$env:NEXT_PUBLIC_API_URL = "http://localhost:8080"; npm run dev
```

Or on macOS/Linux:

```bash
# backend
cd backend
./mvnw spring-boot:run

# frontend
cd frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:8080 npm run dev
```

Open the frontend at http://localhost:3000 and the backend will be available at http://localhost:8080.

---

## 🧩 Features

* User registration & login (JWT)
* Create, read, update, delete personal todos
* Protected API endpoints (only accessible with a valid token)
* Flyway database migrations for schema
* Tailwind-based responsive UI

---

## 🧭 Where to look

* Backend code: `backend/src/main/java/com/todoapp/backend`
* Frontend code: `frontend/app` (Next.js app directory)
* DB migrations: `backend/src/main/resources/db/migration`
* Backend setup guide: `backend/SETUP_BACKEND.md`

---

## 🛠️ Scripts

Backend (from `backend`):

```powershell
# run app using Maven wrapper
./mvnw spring-boot:run
# run tests
./mvnw test
```

Frontend (from `frontend`):

```powershell
npm install
npm run dev      # start Next.js dev server
npm run build    # build for production
npm run start    # start production server after build
```

---

## ✅ Contributing

Contributions welcome. Please create a branch off `main` for each feature/fix and open a PR with a descriptive title. Run tests and ensure linters pass before requesting review.

---

## ⚠ Notes

* Do not commit `.env` files with secrets. Use `.env.example` as a template.
* For CI reliability consider using Testcontainers for DB-dependent tests instead of local DB or shared instances.

---

If you want, I can also add a short README in each subfolder (backend/frontend) with focused, step-by-step instructions — I already prepared `frontend/README.md` and `backend/README.md` updates in this branch.

1. Clone the repo and open the workspace

2. Start the backend (recommended: use the helper script)

PowerShell (from project root):
```powershell
# from the repository root
cd backend
# loads env from backend/.env and runs the Maven wrapper
powershell -ExecutionPolicy Bypass -File .\start-backend.ps1
```

What the script does:
- Loads variables from `backend/.env` into the process environment (do NOT commit real secrets).
- Starts the Spring Boot app using the included Maven wrapper (`mvnw.cmd`).

Alternative manual start (if you prefer):
```powershell
# from the repository root
cd backend
# set env vars in this PowerShell session
$env:DB_USERNAME='todo_user'
$env:DB_PASSWORD='your_db_password'
.\mvnw.cmd spring-boot:run
```

3. Start the frontend

PowerShell (from project root):
```powershell
# from the repository root
cd frontend
npm install   # first time only
npm run dev
```

The frontend runs on `http://localhost:3000` by default and the backend on `http://localhost:8080`.

## Environment files
- `backend/.env` — local environment variables for backend (gitignored). Copy and fill from `backend/.env.example`.
- `frontend/.env.local` — frontend dev env (gitignored). Set `NEXT_PUBLIC_API_URL` if your backend runs on a different host/port.

## Troubleshooting
- Port 8080 already in use: stop the other process or change `server.port` in `backend/src/main/resources/application.properties`.
- DB authentication errors: ensure `DB_USERNAME` / `DB_PASSWORD` match your PostgreSQL user. The helper script loads `backend/.env` into environment variables.
- Schema/DDL ownership errors: if you see errors like "must be owner of table todos" or column-type mismatch, either:
	- Use a DB user that owns the schema/tables, or
	- Set `spring.jpa.hibernate.ddl-auto=none` (or `validate`) in `backend/src/main/resources/application.properties` to avoid automatic DDL.

## Notes for contributors
- Do NOT commit real secrets. `.gitignore` already excludes `.env` and `.env.local`.
- When adding DB migrations or changing entities, coordinate ownership or migration strategy.

## Team Members
- M1 Buddhika 
- M2 Harsha
- M3 Dulanga
- M4 Umesh 
- M5 Chamikara 

## Branch Naming


## Branch naming conventions
Please follow these formats when creating branches so it's easy to understand intent and owner:

- Features
	- feature/<feature-name>-<developer-name>
	- Example: feature/todo-crud-dulanga

- Bugs / Fixes
	- fix/<bug-name>-<developer-name>
	- Example: fix/login-redirect-umesh

- Refactors
	- refactor/<module>-<developer-name>
	- Example: refactor/backend-config-harsha

Using these conventions helps reviewers and CI systems quickly identify purpose and owner. Add your name or short handle at the end so team members know who to contact about the branch.

## Troubleshooting — browser/runtime noise

During development you may see console messages like:

```
Unchecked runtime.lastError: Could not establish connection. Receiving end does not exist.
```

What it means:
- This message is emitted by the browser extension runtime when an extension (or injected script) calls the extension messaging API but there is no listener. It's not generated by your app code or the backend.

How to rule it out:
1. Open an Incognito/Private window (extensions are usually disabled) and repro the issue. If the message disappears, an extension is the cause.
2. Disable extensions temporarily at `chrome://extensions` (or your browser's equivalent) and re-enable them one-by-one to find the culprit.
3. Use a dedicated browser profile for development to avoid extension interference.

When it's safe to ignore:
- If your network requests succeed (server returns JSON with `accessToken`) and the UI behaves correctly, the runtime message is harmless and can be ignored during development. If it blocks network requests or modifies the page, follow the steps above to identify the extension.

If you want help identifying an extension that causes this noise, tell me which browser you're using and I can guide you through the exact devtools steps.
