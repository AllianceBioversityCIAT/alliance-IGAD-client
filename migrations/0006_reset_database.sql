-- Migration: Reset database to correct state
-- Description: Clean up and recreate all tables in correct order

-- Drop all tables to start fresh
DROP TABLE IF EXISTS scraped_data;
DROP TABLE IF EXISTS scraping_sources;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS prompts;
DROP TABLE IF EXISTS users;

-- Create users table with password
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create prompts table
CREATE TABLE prompts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK(type IN ('proposal_writer', 'newsletter_generator')),
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  is_active INTEGER DEFAULT 0,
  created_by INTEGER NOT NULL,
  updated_by INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Create sessions table
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create scraping_sources table
CREATE TABLE scraping_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  url TEXT,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create scraped_data table
CREATE TABLE scraped_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id INTEGER NOT NULL,
  description TEXT NOT NULL,
  data JSON NOT NULL,
  created_by INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (source_id) REFERENCES scraping_sources(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Create all indexes
CREATE INDEX idx_prompts_type ON prompts(type);
CREATE INDEX idx_prompts_active ON prompts(type, is_active);
CREATE INDEX idx_prompts_created_at ON prompts(created_at DESC);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
CREATE INDEX idx_scraped_data_source ON scraped_data(source_id);
CREATE INDEX idx_scraped_data_created_at ON scraped_data(created_at DESC);
CREATE INDEX idx_scraping_sources_name ON scraping_sources(name);

