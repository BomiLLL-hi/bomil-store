ALTER TABLE products ADD COLUMN IF NOT EXISTS extra_categories TEXT[] DEFAULT '{}';
