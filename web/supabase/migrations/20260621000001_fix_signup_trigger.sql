-- Fix: "Database error saving new user" on signup (500)
-- Run this in Supabase SQL Editor if registration fails.

-- 1. Recreate trigger function (safe role, explicit search_path)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'COMMERCIAL'::public.user_role
  );
  RETURN NEW;
END;
$$;

-- 2. Ensure postgres owns the function (bypasses RLS)
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- 3. Grant permissions required by Supabase Auth service
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, service_role;

-- Supabase auth admin role (critical for signup trigger)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN
    GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
    GRANT ALL ON public.profiles TO supabase_auth_admin;
    GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;
  END IF;
END $$;

-- 4. Recreate trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5. Allow profile row creation from signup (belt-and-suspenders with RLS)
DROP POLICY IF EXISTS profiles_insert_signup ON public.profiles;
CREATE POLICY profiles_insert_signup ON public.profiles
  FOR INSERT
  WITH CHECK (true);

-- Note: SELECT/UPDATE policies still restrict access after creation.
