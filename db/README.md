# Database — TO-DO App

This folder contains schema and helper notes for setting up the PostgreSQL database used by the TO-DO App.

---

## 📁 Files

```
db/
├── schema.sql          # DDL for tables (users, todos)
├── SETUP_GUIDE.md      # legacy guide (replaced by this README)
```

---

## 🚀 Quick setup (local Postgres)

### Prerequisites

* PostgreSQL installed and running (default port 5432)
* psql command-line client or a GUI like pgAdmin/DBeaver

### Create DB and user (example)

```bash
# as postgres superuser
psql -U postgres -c "CREATE DATABASE todo_db;"
psql -U postgres -c "CREATE USER todo_user WITH PASSWORD 'your_strong_password';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE todo_db TO todo_user;"
```

### Apply schema

```bash
psql -U todo_user -d todo_db -f db/schema.sql
```

Replace `your_strong_password` with the real value you set in `backend/.env`.

---

## 🔧 Docker (quick option)

```powershell
docker run -d --name todo-postgres -e POSTGRES_DB=todo_db -e POSTGRES_USER=todo_user -e POSTGRES_PASSWORD=todo_password -p 5432:5432 postgres:15
```

Then update `backend/.env` to point to `DB_HOST=localhost` and `DB_PORT=5432`.

---

## ✅ Verify

```bash
psql -U todo_user -d todo_db
\dt
SELECT * FROM users LIMIT 5;
SELECT * FROM todos LIMIT 5;
\q
```

---

## Troubleshooting

- "must be owner of table" errors: ensure the schema owner matches the user or run migrations as the owner.
- Authentication errors: check username/password in `backend/.env`.
- Port conflicts: ensure nothing else binds to 5432 or map to a different host port in Docker.

---

If you want, I can add a `docker-compose.yml` that starts Postgres with the correct DB/user and mounts initial schema — say the word and I'll add it.
