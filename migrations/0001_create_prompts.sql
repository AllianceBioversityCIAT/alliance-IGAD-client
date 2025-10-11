-- Migration: Create prompts table
-- Description: Tabla para almacenar prompts de inteligencia artificial

CREATE TABLE IF NOT EXISTS prompts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  prompt TEXT NOT NULL,
  response TEXT,
  model TEXT DEFAULT 'default',
  tokens INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índice para búsquedas rápidas por fecha
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at DESC);

