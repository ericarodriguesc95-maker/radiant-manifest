
-- Pluggy connected items (bank/credit accounts)
CREATE TABLE public.pluggy_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  pluggy_item_id TEXT NOT NULL UNIQUE,
  connector_name TEXT,
  connector_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'UPDATING',
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pluggy_items TO authenticated;
GRANT ALL ON public.pluggy_items TO service_role;
ALTER TABLE public.pluggy_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own pluggy items" ON public.pluggy_items
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_pluggy_items_updated BEFORE UPDATE ON public.pluggy_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Custom categories (user-defined, PT-BR)
CREATE TABLE public.finance_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('receita','despesa')),
  icon TEXT,
  color TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, name, kind)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.finance_categories TO authenticated;
GRANT ALL ON public.finance_categories TO service_role;
ALTER TABLE public.finance_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own categories" ON public.finance_categories
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_finance_categories_updated BEFORE UPDATE ON public.finance_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Augment finance_entries for Pluggy sync (idempotent)
ALTER TABLE public.finance_entries
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS pluggy_transaction_id TEXT,
  ADD COLUMN IF NOT EXISTS pluggy_item_id TEXT,
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS occurred_at DATE;
CREATE UNIQUE INDEX IF NOT EXISTS finance_entries_pluggy_tx_idx
  ON public.finance_entries(user_id, pluggy_transaction_id)
  WHERE pluggy_transaction_id IS NOT NULL;
