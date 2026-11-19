CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

CREATE OR REPLACE FUNCTION public.assign_memory_lane_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF lower(coalesce(NEW.email, '')) = 'samuelmicheal306@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    DELETE FROM public.user_roles
    WHERE user_id = NEW.id AND role = 'admin';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER assign_memory_lane_owner
AFTER INSERT OR UPDATE OF email ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.assign_memory_lane_owner();

CREATE TABLE public.memory_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL,
  entry_type text NOT NULL CHECK (entry_type IN ('photo', 'video', 'thought')),
  title text NOT NULL,
  note text NOT NULL DEFAULT '',
  media_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.memory_entries TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.memory_entries TO authenticated;
GRANT ALL ON public.memory_entries TO service_role;
ALTER TABLE public.memory_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view memories" ON public.memory_entries
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Owner can add memories" ON public.memory_entries
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owner can edit memories" ON public.memory_entries
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owner can remove memories" ON public.memory_entries
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view memory lane files" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'memory-lane');
CREATE POLICY "Owner can upload memory lane files" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'memory-lane' AND public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Owner can update memory lane files" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'memory-lane' AND public.has_role(auth.uid(), 'admin')
  ) WITH CHECK (
    bucket_id = 'memory-lane' AND public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Owner can delete memory lane files" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'memory-lane' AND public.has_role(auth.uid(), 'admin')
  );