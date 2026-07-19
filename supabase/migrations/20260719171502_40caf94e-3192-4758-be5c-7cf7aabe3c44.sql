
ALTER TABLE public.shopping_list_items
  ADD COLUMN IF NOT EXISTS month_ref DATE NOT NULL DEFAULT date_trunc('month', now())::date,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS price NUMERIC(10,2);

CREATE INDEX IF NOT EXISTS idx_shopping_list_items_user_month
  ON public.shopping_list_items (user_id, month_ref);
