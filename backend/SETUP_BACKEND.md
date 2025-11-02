# Backend — Setup & Start Guide (PowerShell-friendly)

## Purpose

This guide explains how developers on the team can configure, start, and verify the backend locally using the included helper script `start-backend.ps1`. It's written for Windows PowerShell usage but contains notes that apply on macOS/Linux.

## Prerequisites

- Java 21 (or the version the project expects). Verify with:

  ```bash
  java -version
  ```
- Maven wrapper is included in the repo (`mvnw` / `mvnw.cmd`) — no global Maven required.
- PostgreSQL (local) OR network-accessible Postgres credentials. You can also use Docker to run Postgres.
- PowerShell (Windows). On macOS/Linux you can use the shell versions or run the same maven commands directly.
- (Optional) Git and the repo already cloned.

## Files of interest

- `backend/.env.example` — template for local environment variables (safe to commit).
- `backend/.env` — your local copy with secrets (should be gitignored). DO NOT commit this file.
- `backend/start-backend.ps1` — helper PowerShell script that loads `.env` into the environment and runs the backend via the Maven wrapper.
- `backend/src/main/resources/application.properties` — Spring Boot datasource and Flyway settings.
- `backend/src/main/resources/db/migration/` — Flyway SQL migration scripts.

## Quick setup (recommended)

1. From repository root, copy the example `.env` to the real local `.env`:

```powershell
cd backend
Copy-Item .env.example .env
```

2. Edit `backend/.env` and fill real values (use a secure secret for passwords):

- `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`
- Optional: `APP_SECRET` (for JWT), `SPRING_DATASOURCE_URL` if you prefer full JDBC URL.

Example (`backend/.env`):

```text
DB_NAME=todo_db
DB_USERNAME=todo_user
DB_PASSWORD=superSecurePassword
DB_HOST=localhost
DB_PORT=5432
# APP_SECRET=replace_with_secure_jwt_secret
# (Optional) SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/todo_db
```

3. Start backend using the helper script (loads `.env` then runs the app):

```powershell
# from backend/ folder
powershell -ExecutionPolicy Bypass -File .\start-backend.ps1
```

### What `start-backend.ps1` does

- Loads environment variables from `backend/.env` into the PowerShell process so Spring placeholders can use them.
- Runs the Maven wrapper (`mvnw.cmd`/`./mvnw`) to start Spring Boot (spring-boot:run) using the environment values.
- You will see Maven and Spring Boot logs in the terminal. Flyway migrations run on startup (if `spring.flyway.enabled=true`).

## Verify the backend started

- Check console logs for `Started BackendApplication` and no exceptions.
- Verify the health or endpoints with PowerShell:

```powershell
Invoke-RestMethod -Uri 'http://localhost:8080/api/auth/login' -Method Post -ContentType 'application/json' -Body '{"email":"t@test.com","password":"12345"}'
```

(If you haven't created a user, use the `register` endpoint or run the seed migration if available.)

## Run Flyway manually (if needed)

If migrations don't run on startup or you want to run them manually:

```powershell
# from backend folder
# using Maven Flyway plugin if available, or run app which triggers Flyway automatically
.\mvnw flyway:migrate
```

## Running tests

To run backend unit/integration tests locally:

```powershell
# from backend folder
.\mvnw test
```

Notes:
- Tests may use an in-memory DB or run Flyway depending on test configuration. If tests expect a DB, ensure `backend/.env` points to a testable Postgres or see `src/test/resources/application.properties`.

## Common issues & troubleshooting

1) "Connection refused" / JDBC error

- Check `DB_HOST`/`DB_PORT` and that Postgres is running.
- If Postgres requires SSL, ensure the JDBC URL includes the proper params or disable SSL for local dev.

2) Flyway errors (missing driver or org.h2.Driver not found)

- Ensure the correct JDBC driver is on the classpath. We default to Postgres driver in `application.properties`.
- If tests use H2, make sure H2 driver scope is available at test/runtime as configured.

3) Auth errors after login / JWT signature invalid

- Confirm `APP_SECRET` (JWT secret) is consistent across environments. If you rotate it, previously issued tokens become invalid.

4) Port in use (8080)

- Either stop the process using the port or change `server.port` in `application.properties` or set `SERVER_PORT` environment variable.

5) "No token returned" in frontend after login

- The server must return `{ "accessToken": "..." }` for the frontend helper to store the token. Check server response and client logs.

## How to stop the backend

- In the terminal where Maven/`start-backend.ps1` runs press Ctrl+C to stop Spring Boot.
- If you started it detached (custom scripts), stop the process via task manager or `Stop-Process` in PowerShell.

## Optional: Run Postgres with Docker (quick local DB)

If you don't want to install Postgres locally, use Docker:

```powershell
# run a local Postgres container
docker run -d --name todo-postgres -e POSTGRES_DB=todo_db -e POSTGRES_USER=todo_user -e POSTGRES_PASSWORD=todo_password -p 5432:5432 postgres:15
```

Then update `backend/.env` to point to `DB_HOST=localhost` and `DB_PORT=5432` and run `start-backend.ps1`.

## Seeding demo data (optional)

- If a Flyway seed migration is provided (e.g., `V1__seed.sql`) it will populate demo users and todos on migration. Otherwise use `POST /api/auth/register` to create a user.

## CI notes (for maintainers)

- Store any shared DB credentials in the CI secret store (e.g., GitHub Actions secrets) and set `SPRING_DATASOURCE_URL`, `DB_USERNAME`, `DB_PASSWORD`, `APP_SECRET` in the CI job environment.
- Prefer Testcontainers for CI integration tests to ensure isolation and reproducibility.

## If you need help

- If anyone on the team needs access to a managed/shared Postgres instance or a seed migration, ask the repo maintainer or open an issue in the repo.
- For quick debugging, include the Spring Boot startup logs and any Flyway stack traces when asking for help.

---
Generated on: 2025-11-02
