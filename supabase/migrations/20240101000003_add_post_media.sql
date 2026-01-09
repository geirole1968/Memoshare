-- Add media column to posts table to store JSON array of media items
ALTER TABLE posts ADD COLUMN IF NOT EXISTS media JSONB DEFAULT '[]'::jsonb;
