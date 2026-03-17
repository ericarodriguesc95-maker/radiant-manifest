
-- Table for admin-managed content in Alta Performance
CREATE TABLE public.admin_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  category TEXT NOT NULL DEFAULT 'geral',
  icon TEXT NOT NULL DEFAULT '📌',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_content ENABLE ROW LEVEL SECURITY;

-- Everyone can read active content
CREATE POLICY "Anyone can read active content" ON public.admin_content
  FOR SELECT TO authenticated
  USING (is_active = true);

-- Only admins can insert
CREATE POLICY "Admins can insert content" ON public.admin_content
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update
CREATE POLICY "Admins can update content" ON public.admin_content
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete
CREATE POLICY "Admins can delete content" ON public.admin_content
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can also read inactive content
CREATE POLICY "Admins can read all content" ON public.admin_content
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
