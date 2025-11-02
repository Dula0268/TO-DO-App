# Backend — TO-DO App (Spring Boot)

This is the Spring Boot backend for the TO-DO App. It provides authentication (JWT), persistence with PostgreSQL and the REST API consumed by the Next.js frontend.

---

## 📁 Project Structure

```
backend/
├── src/main/java/...       # Spring Boot application code (controllers, services, repos)
├── src/main/resources/    # application.properties, db/migration (Flyway)
├── start-backend.ps1      # PowerShell helper to load .env and run the app
├── .env.example           # template for local env vars
├── pom.xml                # Maven build file
```

---

## 🚀 Getting started (developer flow)

> Recommended: use the included Maven wrapper and the PowerShell helper on Windows.

### 🔧 Prerequisites

* Java 21
* Docker (optional, for Postgres) or PostgreSQL locally
* PowerShell (Windows) or bash (macOS/Linux)

### ➤ Quick start (PowerShell)

```powershell
cd backend
# copy example env and fill values (first time)
Copy-Item .env.example .env
# start backend (loads .env into environment and runs mvnw)
powershell -ExecutionPolicy Bypass -File .\start-backend.ps1
```

Or on macOS/Linux:

```bash
cd backend
cp .env.example .env
./mvnw spring-boot:run
```

The backend will listen on `http://localhost:8080` by default.

---

## 🔧 Environment variables

Copy `backend/.env.example` to `backend/.env` and fill the values. Important variables:

- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`
- `APP_SECRET` — JWT signing secret (set a secure value)
- `SERVER_PORT` — optional override for Spring Boot port

Do NOT commit `backend/.env` to git.

---

## ✅ Common commands

From `backend/`:

```powershell
# build
./mvnw clean package

# run
./mvnw spring-boot:run

# run tests
./mvnw test

# run flyway migrations manually (if needed)
./mvnw flyway:migrate
```

---

## 🧪 Verify & health checks

After startup, verify logs contain "Started BackendApplication" and try the auth endpoints:

```powershell
Invoke-RestMethod -Uri 'http://localhost:8080/api/auth/register' -Method POST -ContentType 'application/json' -Body (@{ username='alice'; email='a@example.com'; password='pass' } | ConvertTo-Json)
Invoke-RestMethod -Uri 'http://localhost:8080/api/auth/login' -Method POST -ContentType 'application/json' -Body (@{ username='alice'; password='pass' } | ConvertTo-Json)
```

On success `login` returns `{ "accessToken": "..." }`.

---

## 🛠 Troubleshooting

- "Connection refused" / DB errors: ensure Postgres is running and `backend/.env` has correct connection info.
- Flyway / driver errors in tests: ensure JDBC driver is available and test scope is correct. Consider Testcontainers for reliable CI tests.
- JWT problems: make sure `APP_SECRET` is consistent across runs (rotating it invalidates existing tokens).

---

## 🔒 Security notes

- Access tokens are short-lived JWTs. For long-lived sessions implement refresh tokens stored in HttpOnly cookies and a `POST /api/auth/refresh` endpoint.
- Always run the app over TLS in production.

---

## 📦 CI / Deployment

Store DB credentials and `APP_SECRET` in your CI secret store. Prefer Testcontainers for integration tests to avoid shared DBs in CI.

---

If you'd like, I can add a Swagger/OpenAPI endpoint, a minimal Postman collection, or a ready-to-run Docker Compose file (Postgres + Backend) — tell me which and I'll add it.
