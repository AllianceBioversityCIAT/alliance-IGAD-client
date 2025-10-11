-- Migration: Add password field to users
-- Description: Add password hash field and update existing users

-- Drop old tables
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

-- Create indexes
CREATE INDEX idx_prompts_type ON prompts(type);
CREATE INDEX idx_prompts_active ON prompts(type, is_active);
CREATE INDEX idx_prompts_created_at ON prompts(created_at DESC);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);