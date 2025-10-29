-- ============================================================================
-- CREATE TABLES SCRIPT
-- ============================================================================
-- Creates the users and todos tables with proper schema
-- Run this AFTER connecting to todo_db database (\c todo_db)
-- ============================================================================

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
    -- Primary Key
    id SERIAL PRIMARY KEY,
    
    -- Todo Content
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Status
    completed BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- User Reference (Foreign Key)
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_completed ON todos(completed);
CREATE INDEX idx_todos_created_at ON todos(created_at);

-- Grant permissions to todo_user
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO todo_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO todo_user;
--     ('Setup backend', 'Create Spring Boot project structure', FALSE, 1),
--     ('Create Todo entity', 'Build JPA entity with all fields', FALSE, 1),
--     ('Write TodoService', 'Implement CRUD business logic', FALSE, 1),
--     ('Build TodoController', 'Create REST endpoints', FALSE, 1);
