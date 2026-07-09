-- Выполните этот SQL в Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'closed')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Индекс для сортировки
CREATE INDEX IF NOT EXISTS clients_created_at_idx ON clients (created_at DESC);

-- Row Level Security
-- ⚠️ Прототип: открытый доступ для всех с anon key.
-- Для продакшена: Supabase Auth + owner_id + политики на auth.uid().
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON clients
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON clients
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON clients
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete" ON clients
  FOR DELETE USING (true);
