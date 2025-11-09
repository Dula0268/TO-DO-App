# TO‑DO App

A full‑stack task manager built with **Next.js** (frontend) and **Spring Boot** (backend), using **PostgreSQL** for data and **Flyway** for migrations. Clean UX with Tailwind + shadcn/ui, JWT auth, and a simple CI setup.

---

## ✨ Features

* 🔐 Authentication: register/login with JWT, protected routes
* ✅ Todos: create, read, update, delete
* ⭐ Priority & status: color‑coded priorities, filters, and grouped view
* 👤 User‑specific data: each user only sees their own todos
* 💾 PostgreSQL + Flyway migrations
* 🧪 Ready for local dev (Windows/PowerShell friendly)

---

## 🧭 Project Structure

```
TO-DO-App/
├─ backend/           # Spring Boot API (Maven wrapper included)
├─ frontend/          # Next.js app (App Router)
├─ db/                # SQL scripts / samples
└─ .github/workflows/ # CI workflows (GitHub Actions)
```

---

## 🚀 Quick Start (Local)

> **Requirements:** Node 18+, Java 17+, PostgreSQL 14+ (local), PowerShell

### 1) Clone

```powershell
git clone https://github.com/Dula0268/TO-DO-App.git
cd TO-DO-App
```

### 2) Backend (Spring Boot)

Create `backend/.env` from the example and adjust values:

```env
# backend/.env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=todo_db
DB_USERNAME=todo_user
DB_PASSWORD=your_db_password

# Spring datasource (derived by script if not set)
SPRING_DB_URL=jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}
SPRING_DB_USERNAME=${DB_USERNAME}
SPRING_DB_PASSWORD=${DB_PASSWORD}

# Hibernate & Flyway
SPRING_JPA_HIBERNATE_DDL_AUTO=validate
SPRING_FLYWAY_ENABLED=true

# JWT
JWT_SECRET=change_me
JWT_EXPIRATION=3600000
```

Start the API:

```powershell
cd backend
powershell -ExecutionPolicy Bypass -File .\start-backend.ps1
```

> Starts on **[http://localhost:8080](http://localhost:8080)** by default.

### 3) Frontend (Next.js)

Create `frontend/.env.local`:

```env
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Install & run:

```powershell
cd ..\frontend
npm install
npm run dev
```

> Opens **[http://localhost:3000](http://localhost:3000)**.

---

## 🔌 API Overview

Base URL: `http://localhost:8080/api`

* `POST /auth/register` – create account
* `POST /auth/login` – returns JWT
* `GET /auth/verify` – verify token & fetch user summary
* `GET /todos` – list current user’s todos
* `POST /todos` – create todo
* `PUT /todos/{id}` – update todo
* `DELETE /todos/{id}` – delete todo

> Include `Authorization: Bearer <token>` for protected routes.

---

## 🧱 Database & Migrations

* **PostgreSQL** is the primary store.
* **Flyway** runs automatically on backend start.
* If you change entities, add a new migration in `backend/src/main/resources/db/migration`.

  * Example: `V2__add_priority_to_todos.sql`

**Common fixes**

* Ownership/permission errors → ensure your DB user owns the schema or set `SPRING_JPA_HIBERNATE_DDL_AUTO=validate`.
* Existing schema mismatch → add a new Flyway migration instead of altering tables manually.

---

## 🧰 Scripts (Windows friendly)

* `backend/start-backend.ps1` – loads `.env` and runs `mvnw spring-boot:run`
* `frontend` – standard `npm run dev`, `npm run build`, `npm start`

---

## 🛡️ Security & Secrets

* Never commit real secrets. `.env` files are git‑ignored.
* Use long random **JWT_SECRET** in production.

See **SECURITY_GUIDE.md** for extra tips.

---

## 👥 Team & Branching

**Members:** Buddhika, Harsha, Dulanga, Umesh, Chamikara

**Branch naming**

* `feature/<short-title>-<name>` → `feature/todo-crud-dulanga`
* `fix/<short-title>-<name>` → `fix/login-redirect-umesh`
* `refactor/<short-title>-<name>` → `refactor/backend-config-harsha`

**PR checklist**

* Meaningful title + description (what/why)
* Screenshots for UI changes
* Notes on DB changes (and new Flyway files)

---

## 🧪 Troubleshooting

* **8080 already in use** → change `server.port` in `backend/src/main/resources/application.properties`
* **DB auth errors** → check `DB_USERNAME/DB_PASSWORD` and database exists
* **H2 driver errors in CI** → ensure Postgres driver is used; set datasource to Postgres
* **CORS / API URL issues** → confirm `NEXT_PUBLIC_API_URL`

---

## 🛠️ Tech Stack

* **Frontend:** Next.js, React, Tailwind CSS, shadcn/ui
* **Backend:** Spring Boot, Spring Security, JWT
* **DB:** PostgreSQL, Flyway
* **CI:** GitHub Actions (basic)

---

## 📦 Optional: Docker (future)

For team‑wide dev parity, consider Docker Compose with services for `api`, `web`, and `db`. Add a `docker-compose.yml` and environment files; keep secrets out of VCS.

