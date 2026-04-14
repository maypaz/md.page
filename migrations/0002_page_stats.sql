-- Add stats columns to pages
ALTER TABLE pages ADD COLUMN view_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE pages ADD COLUMN revision_count INTEGER NOT NULL DEFAULT 1;
ALTER TABLE pages ADD COLUMN created_via TEXT NOT NULL DEFAULT 'web';
