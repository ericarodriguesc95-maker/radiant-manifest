
ALTER TABLE public.calendar_events 
ADD COLUMN recurrence TEXT DEFAULT 'none',
ADD COLUMN recurrence_parent_id UUID REFERENCES public.calendar_events(id) ON DELETE CASCADE;
