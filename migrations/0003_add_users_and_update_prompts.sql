-- Migration: Add users and update prompts table
-- Description: Create users table and add type, activation, and user tracking to prompts

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default users
INSERT INTO users (email, name) VALUES 
  ('hector@igad.com', 'Hector'),
  ('enrique@igad.com', 'Enrique'),
  ('yecksin@igad.com', 'Yecksin');

-- Drop old prompts table
DROP TABLE IF EXISTS prompts;

-- Create new prompts table with all fields
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

-- Create indexes
CREATE INDEX idx_prompts_type ON prompts(type);
CREATE INDEX idx_prompts_active ON prompts(type, is_active);
CREATE INDEX idx_prompts_created_at ON prompts(created_at DESC);

-- Create sessions table for authentication
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_sessions_expires ON sessions(expires_at);

