-- Update create_welcome_post to also notify all existing users
CREATE OR REPLACE FUNCTION public.create_welcome_post()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_name TEXT;
  post_text TEXT;
  new_post_id UUID;
  existing_user RECORD;
BEGIN
  user_name := COALESCE(NEW.display_name, 'Uma nova girl');
  post_text := user_name || ' entrou para o Glow Up! 🦋✨ Bem-vinda à nossa comunidade!';
  
  INSERT INTO public.community_posts (user_id, text)
  VALUES (NEW.user_id, post_text)
  RETURNING id INTO new_post_id;

  -- Notify all existing users about the new member
  FOR existing_user IN 
    SELECT user_id FROM public.profiles WHERE user_id != NEW.user_id
  LOOP
    INSERT INTO public.notifications (user_id, from_user_id, type, post_id, comment_text)
    VALUES (existing_user.user_id, NEW.user_id, 'welcome', new_post_id, post_text);
  END LOOP;

  RETURN NEW;
END;
$function$;