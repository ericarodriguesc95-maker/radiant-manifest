
-- Auto-create a welcome post when a new profile is created
CREATE OR REPLACE FUNCTION public.create_welcome_post()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
AS $$
DECLARE
  user_name TEXT;
  post_text TEXT;
BEGIN
  user_name := COALESCE(NEW.display_name, 'Uma nova girl');
  post_text := user_name || ' entrou para o Glow Up! 🦋✨ Bem-vinda à nossa comunidade!';
  INSERT INTO public.community_posts (user_id, text)
  VALUES (NEW.user_id, post_text);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created_welcome_post
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_welcome_post();
