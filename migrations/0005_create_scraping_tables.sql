-- Migration: Create scraping tables
-- Description: Add tables for storing web scraping results and their sources

-- Create scraping_sources table (categories/pages)
CREATE TABLE IF NOT EXISTS scraping_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  url TEXT,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create scraped_data table (stores JSON results)
CREATE TABLE IF NOT EXISTS scraped_data (
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

-- Create indexes for better query performance
CREATE INDEX idx_scraped_data_source ON scraped_data(source_id);
CREATE INDEX idx_scraped_data_created_at ON scraped_data(created_at DESC);
CREATE INDEX idx_scraping_sources_name ON scraping_sources(name);

