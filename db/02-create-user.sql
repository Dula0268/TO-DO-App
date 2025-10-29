-- ============================================================================
-- CREATE USER SCRIPT
-- ============================================================================
-- This script creates the todo_user role
-- Run this as postgres (admin) user
-- ============================================================================

-- Drop user if exists (optional, uncomment if needed)
-- DROP USER IF EXISTS todo_user;

-- Create the user with password from .env
CREATE USER todo_user WITH PASSWORD 'b4code';

-- Grant privileges on the todo_db database
GRANT ALL PRIVILEGES ON DATABASE todo_db TO todo_user;

-- Grant schema privileges
\c todo_db
GRANT USAGE ON SCHEMA public TO todo_user;
GRANT CREATE ON SCHEMA public TO todo_user;
