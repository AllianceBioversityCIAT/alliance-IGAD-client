-- Migration: Simplify prompts table
-- Description: Remove unnecessary fields, keep only title and prompt

-- Drop the old table
DROP TABLE IF EXISTS prompts;

-- Create simplified table
CREATE TABLE prompts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast date searches
CREATE INDEX idx_prompts_created_at ON prompts(created_at DESC);

