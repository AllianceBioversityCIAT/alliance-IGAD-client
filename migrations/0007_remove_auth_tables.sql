-- Migration: Remove authentication tables
-- Description: Drop users and sessions tables, update prompts to be public

-- Drop authentication tables
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS users;

-- Recreate prompts table without user foreign keys
DROP TABLE IF EXISTS prompts;

CREATE TABLE prompts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK(type IN ('proposal_writer', 'newsletter_generator')),
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  is_active INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_prompts_type ON prompts(type);
CREATE INDEX idx_prompts_active ON prompts(type, is_active);
CREATE INDEX idx_prompts_created_at ON prompts(created_at DESC);

-- Update scraped_data table to remove user foreign key if it exists
DROP TABLE IF EXISTS scraped_data;

CREATE TABLE scraped_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id INTEGER NOT NULL,
  description TEXT NOT NULL,
  data JSON NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (source_id) REFERENCES scraping_sources(id) ON DELETE CASCADE
);

-- Recreate indexes for scraped_data
CREATE INDEX idx_scraped_data_source ON scraped_data(source_id);
CREATE INDEX idx_scraped_data_created_at ON scraped_data(created_at DESC);
