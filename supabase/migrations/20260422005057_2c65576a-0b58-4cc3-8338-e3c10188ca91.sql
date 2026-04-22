
-- Trigger function: dispara uma notificação por usuária quando uma nova atualização do app é publicada
CREATE OR REPLACE FUNCTION public.notify_users_of_app_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user RECORD;
  notif_text TEXT;
BEGIN
  -- Texto que aparecerá no sininho
  notif_text := COALESCE(NEW.icon, '🎁') || ' Nova novidade: ' || NEW.title;

  -- Cria uma notificação tipo 'app_update' para cada usuária com perfil
  FOR target_user IN
    SELECT user_id FROM public.profiles
  LOOP
    INSERT INTO public.notifications (user_id, from_user_id, type, comment_text, read)
    VALUES (target_user.user_id, target_user.user_id, 'app_update', notif_text, false);
  END LOOP;

  RETURN NEW;
END;
$$;

-- Trigger no INSERT em app_updates
DROP TRIGGER IF EXISTS on_app_update_notify_users ON public.app_updates;
CREATE TRIGGER on_app_update_notify_users
AFTER INSERT ON public.app_updates
FOR EACH ROW
EXECUTE FUNCTION public.notify_users_of_app_update();
