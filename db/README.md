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

---

## ⚙️ Requirements

Before running any commands, make sure you have:

- PostgreSQL installed (version 13 or higher)
- Access to a `postgres` superuser account
- The `psql` command-line tool or pgAdmin/DBeaver

---

## 🚀 Quick Setup (Local Development)

### 1️⃣ Open a terminal as the postgres user
You can do this either by switching to the `postgres` account or using `psql -U postgres`.

### 2️⃣ Run the setup script
Pass the desired password for the app database user (to be reused in your `.env`).

```bash
# Example (Linux/Mac)
psql -U postgres -v DB_PASSWORD='my_secure_password' -f db/schema.sql

# Example (Windows PowerShell)
psql -U postgres -v DB_PASSWORD="$env:DB_PASSWORD" -f db/schema.sql
