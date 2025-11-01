-- ============================================================================
-- POSTGRESQL DATABASE SCHEMA - TODO APPLICATION
-- ============================================================================
-- Complete database setup script: database, user, tables, and permissions
-- Run this script as postgres (admin) user
-- ============================================================================

-- Step 1: Create Database
-- ============================================================================
CREATE DATABASE todo_db;

-- Step 2: Create User Role with Permissions
-- ============================================================================
-- ⚠️ IMPORTANT: Do NOT hardcode passwords in this file!
-- Use psql variable substitution to securely pass the password:
--   psql -v DB_PASSWORD=$DB_PASSWORD -f db/schema.sql
CREATE USER todo_user WITH PASSWORD :'DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE todo_db TO todo_user;

-- Step 3: Connect to todo_db and Create Tables
-- ============================================================================
-- Note: In psql, run: \c todo_db before continuing

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create todos table
CREATE TABLE IF NOT EXISTS todos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Step 4: Create Indexes for Performance
-- ============================================================================
CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_completed ON todos(completed);
CREATE INDEX idx_todos_created_at ON todos(created_at);

-- Step 5: Grant Permissions to Application User
-- ============================================================================
GRANT USAGE ON SCHEMA public TO todo_user;
GRANT CREATE ON SCHEMA public TO todo_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO todo_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO todo_user;

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================
-- You can now connect as: psql -U todo_user -d todo_db
-- All tables are ready for application use
