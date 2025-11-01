# To-Do Application

## Structure
- `frontend` → Next.js app
- `backend` → Spring Boot app
- `db` → PostgreSQL scripts (tables, seed data)

## Quick start (recommended)
Follow these steps to run the app locally (PowerShell examples provided):

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
