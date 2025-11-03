\set ON_ERROR_STOP on
-- ============================================================================
-- PostgreSQL schema: TODO App (idempotent, Windows-friendly)
-- Run with (PowerShell):
--   psql -U postgres -v DB_PASSWORD="$env:DB_PASSWORD" -f db/schema.sql
-- ============================================================================

-- 1) Create database if it doesn't exist (no extensions needed)
SELECT 'CREATE DATABASE todo_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'todo_db');
\gexec

-- 2) Create login role if it doesn't exist (password from psql var)
SELECT 'CREATE ROLE todo_user LOGIN PASSWORD '
       || quote_literal(:'DB_PASSWORD')
WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'todo_user');
\gexec

-- Make the app role own the DB (safe if already owner)
ALTER DATABASE todo_db OWNER TO todo_user;

-- 3) Work inside todo_db from now on
\connect todo_db

-- Ensure public schema is owned by the app role (safe if already)
ALTER SCHEMA public OWNER TO todo_user;

-- 4) Tables
CREATE TABLE IF NOT EXISTS users (
    user_id     SERIAL PRIMARY KEY,
    username    VARCHAR(100) UNIQUE NOT NULL,
    email       VARCHAR(150) UNIQUE NOT NULL,
    password    VARCHAR(200) NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS todos (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    completed   BOOLEAN NOT NULL DEFAULT FALSE,
    user_id     INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    priority    VARCHAR(16) NOT NULL DEFAULT 'MEDIUM',
    category    VARCHAR(64),
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add priority and category columns if table already exists (migration for existing DBs)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'todos' AND column_name = 'priority') THEN
    ALTER TABLE todos ADD COLUMN priority VARCHAR(16) NOT NULL DEFAULT 'MEDIUM';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'todos' AND column_name = 'category') THEN
    ALTER TABLE todos ADD COLUMN category VARCHAR(64);
  END IF;
END$$;

-- 5) “updated_at” auto-refresh trigger (create only if missing)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'todos_set_updated_at') THEN
    CREATE TRIGGER todos_set_updated_at
    BEFORE UPDATE ON todos
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
  END IF;
END$$;

-- 6) Indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_todos_user_id     ON todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_completed   ON todos(completed);
CREATE INDEX IF NOT EXISTS idx_todos_created_at  ON todos(created_at);
CREATE INDEX IF NOT EXISTS idx_todos_priority    ON todos(priority);
CREATE INDEX IF NOT EXISTS idx_todos_category    ON todos(category);

-- 7) Permissions for application user
GRANT CONNECT ON DATABASE todo_db TO todo_user;
GRANT USAGE, CREATE ON SCHEMA public TO todo_user;

-- Current objects
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO todo_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO todo_user;

-- Future objects (important when you add new tables/sequences)
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO todo_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT USAGE, SELECT ON SEQUENCES TO todo_user;

-- Done: connect using
--   psql -U todo_user -d todo_db
