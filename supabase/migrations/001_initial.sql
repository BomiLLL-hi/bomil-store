-- MM2 Store — Initial Schema

-- Products
CREATE TABLE IF NOT EXISTS products (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  title        TEXT        NOT NULL,
  slug         TEXT        UNIQUE NOT NULL,
  aliases      TEXT[]      DEFAULT '{}',
  description  TEXT        DEFAULT '',
  images       TEXT[]      DEFAULT '{}',
  category     TEXT        NOT NULL DEFAULT 'godly',  -- godly | chroma | vintage | set | pet
  type         TEXT        NOT NULL DEFAULT 'other',  -- knife | gun | pet | other
  stock_status TEXT        NOT NULL DEFAULT 'in_stock', -- in_stock | sold_out
  current_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  old_price    NUMERIC(10,2),
  hidden_status BOOLEAN    DEFAULT FALSE,
  is_set       BOOLEAN     DEFAULT FALSE,
  is_best_of_all_time BOOLEAN DEFAULT FALSE,
  included_items UUID[]    DEFAULT '{}',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read visible products"
  ON products FOR SELECT
  USING (hidden_status = FALSE);

-- Site settings (usd_rate, etc.)
CREATE TABLE IF NOT EXISTS site_settings (
  id    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key   TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read settings"
  ON site_settings FOR SELECT
  TO PUBLIC USING (TRUE);

INSERT INTO site_settings (key, value)
VALUES ('usd_rate', '90')
ON CONFLICT (key) DO NOTHING;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Sample data
INSERT INTO products (title, slug, aliases, description, category, type, stock_status, current_price, old_price, is_best_of_all_time) VALUES
  ('Harvester', 'harvester', ARRAY['harv','harvester','harvestor','харвестер','сборщик','арбалет'], 'Rare godly scythe. One of the most iconic weapons in MM2.', 'godly', 'knife', 'in_stock', 5000, 6000, true),
  ('Chroma Laser', 'chroma-laser', ARRAY['laser','chroma laser','хрома лазер','хрома'], 'Exclusive chroma gun with rainbow effect.', 'chroma', 'gun', 'in_stock', 8000, NULL, false),
  ('Corrupt', 'corrupt', ARRAY['corrupt','корrupt','корапт'], 'One of the rarest vintage knives.', 'vintage', 'knife', 'sold_out', 15000, NULL, true),
  ('Shadow', 'shadow', ARRAY['shadow','шадов','тень'], 'Classic godly knife.', 'godly', 'knife', 'in_stock', 3500, NULL, false),
  ('Gemstone', 'gemstone', ARRAY['gemstone','гемстоун','камень'], 'Shiny godly knife with gem design.', 'godly', 'knife', 'in_stock', 4200, 4800, false),
  ('Batwing', 'batwing', ARRAY['bat','batwing','крыло', 'крыло летучей мыши'], 'Godly gun shaped like a bat.', 'godly', 'gun', 'in_stock', 2800, NULL, false),
  ('Candy Set', 'candy-set', ARRAY['candy','кенди','конфета','сет'], 'Sweet candy themed set with multiple items.', 'set', 'other', 'in_stock', 2000, 2500, false),
  ('Chroma Bonfire', 'chroma-bonfire', ARRAY['bonfire','chroma bonfire','бонфайр','костёр'], 'Chroma knife with fire effects.', 'chroma', 'knife', 'in_stock', 9500, NULL, true),
  ('Tiger Shark', 'tiger-shark', ARRAY['shark','tiger','тигровая акула','акула'], 'Vintage gun modeled after a tiger shark.', 'vintage', 'gun', 'in_stock', 7000, 8000, false),
  ('Cerberus', 'cerberus', ARRAY['cerberus','цербер','собака'], 'Rare godly knife pet.', 'pet', 'pet', 'sold_out', 12000, NULL, true);
