-- MM2 Store — Orders

CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1000;

CREATE TABLE IF NOT EXISTS orders (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number     TEXT UNIQUE NOT NULL DEFAULT ('MM2-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 6, '0')),
  user_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email            TEXT NOT NULL,
  roblox_username  TEXT NOT NULL,
  roblox_user_id   BIGINT NOT NULL DEFAULT 0,
  items            JSONB NOT NULL DEFAULT '[]',
  total_rub        NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'pending',
  payment_provider TEXT,
  payment_id       TEXT,
  payment_url      TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  paid_at          TIMESTAMPTZ,
  delivered_at     TIMESTAMPTZ,
  cancelled_at     TIMESTAMPTZ
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Авторизованный пользователь видит только свои заказы
CREATE POLICY "Users read own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Service role (API routes, webhooks) может всё — она обходит RLS по умолчанию

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
