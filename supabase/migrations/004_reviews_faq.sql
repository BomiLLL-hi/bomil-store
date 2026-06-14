-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id   UUID        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  rating     SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text       TEXT        NOT NULL DEFAULT '',
  status     TEXT        NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (order_id)
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public can read approved reviews
CREATE POLICY "Public read approved reviews"
  ON reviews FOR SELECT
  USING (status = 'approved');

-- Authenticated user can insert their own review
CREATE POLICY "User can insert review"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- FAQ
CREATE TABLE IF NOT EXISTS faq (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  question_ru TEXT        NOT NULL,
  question_en TEXT        NOT NULL,
  answer_ru   TEXT        NOT NULL,
  answer_en   TEXT        NOT NULL,
  sort_order  SMALLINT    NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE faq ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read faq"
  ON faq FOR SELECT
  TO PUBLIC USING (TRUE);

-- Sample FAQ
INSERT INTO faq (question_ru, question_en, answer_ru, answer_en, sort_order) VALUES
  ('Как получить заказ?', 'How do I receive my order?',
   'После оплаты напишите номер заказа в Live Chat в правом нижнем углу сайта. Модератор добавит вас в Roblox и передаст товар.',
   'After payment, send your order number in the Live Chat in the bottom-right corner. A moderator will add you in Roblox and deliver your item.',
   1),
  ('Сколько ждать выдачи?', 'How long does delivery take?',
   'Обычно от 2 до 10 минут. В часы пик может быть немного дольше. Мы работаем ежедневно.',
   'Usually 2 to 10 minutes. During peak hours it may take a bit longer. We work every day.',
   2),
  ('Возможен ли возврат?', 'Is a refund possible?',
   'Да, если товар ещё не был передан. Напишите в Live Chat и укажите номер заказа — мы всё решим.',
   'Yes, if the item has not been delivered yet. Message us in Live Chat with your order number and we will sort it out.',
   3),
  ('Нужна ли регистрация для покупки?', 'Do I need an account to buy?',
   'Регистрация необязательна для просмотра каталога, но для оформления заказа потребуется email.',
   'Registration is not required to browse, but you will need an email address to place an order.',
   4),
  ('Какие способы оплаты доступны?', 'What payment methods are available?',
   'Мы принимаем карты Visa/Mastercard, СБП и другие популярные способы. Полный список — на странице оплаты.',
   'We accept Visa/Mastercard, SBP, and other popular methods. Full list is shown at checkout.',
   5);
