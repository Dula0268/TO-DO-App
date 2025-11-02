# 🗄️ PostgreSQL Database Setup — TO-DO App

This folder contains the database schema and setup instructions for the **TO-DO App** backend.

---

## 📘 Overview

The database uses **PostgreSQL** and defines two main tables:

| Table | Purpose |
|--------|----------|
| `users` | Stores registered user accounts |
| `todos` | Stores to-do items linked to a user |

The provided script `schema.sql` creates the **database**, **user**, **tables**, and **permissions** automatically.  
A PowerShell helper script (`setup-db.ps1`) loads your `.env` file and runs the schema safely with the correct credentials.

---

## ⚙️ Requirements

Before running any commands, make sure you have:

- PostgreSQL installed (version 13 or higher)  
- Access to a `postgres` superuser account  
- The `psql` command-line tool (included with PostgreSQL)  
- A valid `.env` file containing your database credentials (for example, `backend\.env`)

---

## 🚀 Quick Setup (Local Development)

### 🪟 **Windows PowerShell**

```powershell
# 1️⃣ Run the setup script (it automatically reads your .env)
cd db
.\setup-db.ps1 -EnvPath "..\backend\.env"
```

> This script:
> - Reads all variables from your `.env`
> - Passes `DB_PASSWORD` securely into `psql`
> - Executes `schema.sql` to create or update the database, role, and tables

Example output:
```
Using .env at: ..\backend\.env
Loaded .env. Running schema with DB_PASSWORD from .env...
Database setup complete!
```

---

### 🐧 **Linux / macOS (manual alternative)**

If you’re on Linux or macOS and don’t have PowerShell:

```bash
# Export password from .env and run schema manually
export DB_PASSWORD=$(grep DB_PASSWORD ../backend/.env | cut -d '=' -f2)
psql -U postgres -v DB_PASSWORD="$DB_PASSWORD" -f db/schema.sql
```

---

## ✅ Verification

After running the setup, verify everything works:

```bash
# Check that tables were created
psql -U postgres -d todo_db -c "\dt"

# Test app user connection
psql -U todo_user -d todo_db -h localhost -W -c "SELECT current_user, current_database();"
```

If both commands succeed, your backend is ready to connect to the database using the same credentials from your `.env`.

---

## 👥 Team Setup Tip

Each teammate can simply run:

```powershell
cd db
.\setup-db.ps1 -EnvPath "..\backend\.env"
```

This ensures everyone’s local database matches the same schema and credentials without hardcoding passwords.

---

## 🧩 Notes

- The script is **idempotent** — running it multiple times won’t duplicate or break objects.
- All credentials are loaded securely from your `.env`.
- Keep `.env` in your `.gitignore` to prevent sensitive data from being committed.

---
