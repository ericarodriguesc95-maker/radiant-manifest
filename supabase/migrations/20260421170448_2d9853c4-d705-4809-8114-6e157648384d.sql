-- Allow admin to grant access by email even if the user hasn't signed up yet
-- Make user_id nullable so we can pre-register subscriptions by email
ALTER TABLE public.subscriptions ALTER COLUMN user_id DROP NOT NULL;

-- Drop old unique constraint on user_id (would block multiple null pre-registrations)
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_key;

-- Recreate as a partial unique index that ignores nulls
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_user_id_unique
  ON public.subscriptions(user_id)
  WHERE user_id IS NOT NULL;

-- Unique on email to avoid duplicates
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_email_unique
  ON public.subscriptions(lower(email));

-- Admin function: grant access by email
CREATE OR REPLACE FUNCTION public.admin_grant_access(
  _email TEXT,
  _plan_type TEXT,
  _status TEXT
)
RETURNS public.subscriptions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _target_user_id UUID;
  _expiry TIMESTAMPTZ;
  _result public.subscriptions;
BEGIN
  -- Only admins
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Apenas administradores podem conceder acesso';
  END IF;

  IF _plan_type NOT IN ('monthly','lifetime') THEN
    RAISE EXCEPTION 'plan_type inválido';
  END IF;

  IF _status NOT IN ('active','canceled','trialing','inactive') THEN
    RAISE EXCEPTION 'status inválido';
  END IF;

  -- Try to find an existing auth user by email
  SELECT id INTO _target_user_id
  FROM auth.users
  WHERE lower(email) = lower(_email)
  LIMIT 1;

  IF _plan_type = 'lifetime' THEN
    _expiry := NULL;
  ELSE
    _expiry := now() + interval '30 days';
  END IF;

  INSERT INTO public.subscriptions (user_id, email, status, plan_type, expiry_date)
  VALUES (_target_user_id, lower(_email), _status, _plan_type, _expiry)
  ON CONFLICT (lower(email)) DO UPDATE
  SET user_id = COALESCE(EXCLUDED.user_id, public.subscriptions.user_id),
      status = EXCLUDED.status,
      plan_type = EXCLUDED.plan_type,
      expiry_date = EXCLUDED.expiry_date,
      updated_at = now()
  RETURNING * INTO _result;

  RETURN _result;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_grant_access(TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_grant_access(TEXT, TEXT, TEXT) TO authenticated;