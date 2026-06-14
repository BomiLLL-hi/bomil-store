-- MM2 Store — Live Chat

CREATE SEQUENCE IF NOT EXISTS ticket_number_seq START 1000;

CREATE TABLE IF NOT EXISTS chat_sessions (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status        TEXT NOT NULL DEFAULT 'active',  -- active | closed
  type          TEXT,                             -- order | question
  order_id      UUID REFERENCES orders(id) ON DELETE SET NULL,
  ticket_number TEXT UNIQUE,
  operator_id   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id  UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL,  -- user | bot | operator
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own chat sessions"
  ON chat_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users read own chat messages"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND chat_sessions.user_id = auth.uid()
    )
  );

CREATE TRIGGER chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Функция для генерации номера тикета
CREATE OR REPLACE FUNCTION next_ticket_number()
RETURNS BIGINT AS $$
  SELECT NEXTVAL('ticket_number_seq')
$$ LANGUAGE SQL SECURITY DEFINER;

-- Включаем Realtime для chat_messages (для операторских ответов в Фазе 5)
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
