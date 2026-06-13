
-- Add mode column to finance_entries and finance_notes
ALTER TABLE public.finance_entries
  ADD COLUMN IF NOT EXISTS mode text NOT NULL DEFAULT 'pf' CHECK (mode IN ('pf','cnpj'));
ALTER TABLE public.finance_notes
  ADD COLUMN IF NOT EXISTS mode text NOT NULL DEFAULT 'pf' CHECK (mode IN ('pf','cnpj'));

-- Budgets per category/month/mode
CREATE TABLE IF NOT EXISTS public.finance_budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  mode text NOT NULL DEFAULT 'pf' CHECK (mode IN ('pf','cnpj')),
  category text NOT NULL,
  ceiling numeric NOT NULL DEFAULT 0,
  month integer NOT NULL,
  year integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, mode, category, month, year)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.finance_budgets TO authenticated;
GRANT ALL ON public.finance_budgets TO service_role;
ALTER TABLE public.finance_budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own budgets" ON public.finance_budgets
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Debts
CREATE TABLE IF NOT EXISTS public.finance_debts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  mode text NOT NULL DEFAULT 'pf' CHECK (mode IN ('pf','cnpj')),
  name text NOT NULL,
  total_amount numeric NOT NULL DEFAULT 0,
  paid_amount numeric NOT NULL DEFAULT 0,
  monthly_interest numeric NOT NULL DEFAULT 0,
  installments_total integer,
  installments_paid integer NOT NULL DEFAULT 0,
  due_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.finance_debts TO authenticated;
GRANT ALL ON public.finance_debts TO service_role;
ALTER TABLE public.finance_debts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own debts" ON public.finance_debts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_finance_budgets_updated_at BEFORE UPDATE ON public.finance_budgets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_finance_debts_updated_at BEFORE UPDATE ON public.finance_debts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
