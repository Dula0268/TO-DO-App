-- Migration: Add priority and category columns to todos table
-- Date: 2024
-- Description: Adds priority (HIGH/MEDIUM/LOW) and category support to todos

-- Add priority column with default MEDIUM
ALTER TABLE todos 
ADD COLUMN IF NOT EXISTS priority VARCHAR(16) NOT NULL DEFAULT 'MEDIUM';

-- Add category column (nullable)
ALTER TABLE todos 
ADD COLUMN IF NOT EXISTS category VARCHAR(64);

-- Optional: Add indexes for filtering performance
CREATE INDEX IF NOT EXISTS idx_todos_priority ON todos(priority);
CREATE INDEX IF NOT EXISTS idx_todos_category ON todos(category);

-- Update existing todos to have MEDIUM priority if NULL
UPDATE todos SET priority = 'MEDIUM' WHERE priority IS NULL;
