-- ============================================================================
-- SETUP INSTRUCTIONS FOR TODO DATABASE
-- ============================================================================
-- This guide helps you set up the PostgreSQL database for the Todo app
-- ============================================================================

## 🗄️ DATABASE SETUP GUIDE

### Prerequisites:
- PostgreSQL installed on your machine
- PostgreSQL running (default port: 5432)
- Access to psql command line

### Setup Steps:

#### Step 1: Open PostgreSQL Terminal
```powershell
# On Windows, open Command Prompt or PowerShell
# Then connect to PostgreSQL as admin
psql -U postgres
```

#### Step 2: Run Database Creation Scripts (IN ORDER)

**Run Script 1: Create Database**
```powershell
psql -U postgres -f "db/01-create-database.sql"
```

**Run Script 2: Create User (WITH PASSWORD VARIABLE)**
```powershell
# ⚠️ IMPORTANT: Pass password via -v flag (NOT hardcoded)
psql -U postgres -v db_password="'b4code'" -f "db/02-create-user.sql"
```
Or in one line:
```powershell
psql -U postgres -c "CREATE USER todo_user WITH PASSWORD 'b4code'; GRANT ALL PRIVILEGES ON DATABASE todo_db TO todo_user;"
```

**SECURITY NOTE:**
- Never hardcode passwords in SQL files!
- Use `-v` flag to pass variables to psql
- Store real passwords in `.env` file (not in git)

**Run Script 3: Create Tables**
```sql
-- First connect to todo_db
\c todo_db

-- Copy the contents of 03-create-todos-table.sql and paste in psql
-- Or run: psql -U todo_user -d todo_db -f "db/03-create-todos-table.sql"
-- (This will create the todos table with indexes and permissions)
```

#### Step 3: Verify Setup
```sql
-- Connect as todo_user to verify everything works
psql -U todo_user -d todo_db

-- List tables
\dt

-- You should see the "todos" table
-- Exit with: \q
```

### Quick Command Reference:

```powershell
# Connect as postgres (admin)
psql -U postgres

# Connect as todo_user
psql -U todo_user -d todo_db

# Run SQL file
psql -U postgres -f "path/to/script.sql"

# Exit psql
\q

# List all databases
\l

# Connect to a specific database
\c database_name

# List all tables in current database
\dt

# Describe a table structure
\d table_name
```

### Database Credentials Summary:

| Item | Value |
|------|-------|
| Database Name | `todo_db` |
| Username | `todo_user` |
| Password | `b4code` |
| Port | `5432` |
| Host | `localhost` |

### Seed Data (Optional):

To add test data, connect as todo_user and run:

```sql
INSERT INTO todos (title, description, completed, user_id)
VALUES 
    ('Setup backend', 'Create Spring Boot project structure', FALSE, 1),
    ('Create Todo entity', 'Build JPA entity with all fields', FALSE, 1),
    ('Write TodoService', 'Implement CRUD business logic', FALSE, 1),
    ('Build TodoController', 'Create REST endpoints', FALSE, 1);

-- Verify data
SELECT * FROM todos;
```

### Troubleshooting:

**Error: "database todo_db already exists"**
- Comment out the CREATE DATABASE line or use: CREATE DATABASE IF NOT EXISTS todo_db;

**Error: "role todo_user already exists"**
- Drop the user first: DROP USER IF EXISTS todo_user;

**Error: "permission denied"**
- Make sure you're running scripts as postgres user for user/database creation
- Use: GRANT USAGE ON SCHEMA public TO todo_user;

---

## � **SECURITY BEST PRACTICES**

### ✅ DO:
- Use `.env` file for local credentials (add to `.gitignore`)
- Use environment variables in production
- Pass passwords via command-line flags (`-v` in psql)
- Use `.env.example` as template (no real values)
- Rotate passwords regularly
- Use strong passwords (at least 12 characters)

### ❌ DON'T:
- Hardcode passwords in SQL files
- Commit `.env` to git
- Use simple passwords like "1234"
- Share credentials in Slack/email
- Reuse passwords across projects

---

## �📝 Next Steps:

1. ✅ Run all 3 SQL scripts in order
2. ✅ Verify the database is created and tables exist
3. ⏭️ We'll create the Spring Boot backend next
4. ⏭️ Configure application.properties with these credentials

---

## 🔗 Spring Boot Configuration (Coming Next):

Your backend will connect using:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/todo_db
spring.datasource.username=todo_user
spring.datasource.password=b4code
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.hibernate.ddl-auto=validate
```

