
-- 1) Profiles: restrict reads
DROP POLICY IF EXISTS profiles_authenticated_read ON public.profiles;
DROP POLICY IF EXISTS profiles_select_self ON public.profiles;
DROP POLICY IF EXISTS profiles_select_shared_project ON public.profiles;
DROP POLICY IF EXISTS profiles_select_admin ON public.profiles;

CREATE POLICY profiles_select_self ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY profiles_select_admin ON public.profiles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY profiles_select_shared_project ON public.profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.project_members pm1
      JOIN public.project_members pm2 ON pm1.project_id = pm2.project_id
      WHERE pm1.user_id = auth.uid()
        AND pm2.user_id = public.profiles.id
    )
  );

-- 2) Clients: scope reads
DROP POLICY IF EXISTS clients_select_auth ON public.clients;
CREATE POLICY clients_select_auth ON public.clients
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1
      FROM public.projects p
      JOIN public.project_members pm ON pm.project_id = p.id
      WHERE p.client_id = public.clients.id
        AND pm.user_id = auth.uid()
    )
  );

-- 3) Activities: require project membership on insert
DROP POLICY IF EXISTS activities_insert_auth ON public.activities;
CREATE POLICY activities_insert_auth ON public.activities
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND (project_id IS NULL OR public.is_project_member(project_id, auth.uid()))
  );

-- 4) Storage bucket bim-alazab: enforce project membership via path prefix
-- Convention: object name must begin with "<project_uuid>/..."
DROP POLICY IF EXISTS storage_read ON storage.objects;
DROP POLICY IF EXISTS storage_upload ON storage.objects;
DROP POLICY IF EXISTS storage_update ON storage.objects;
DROP POLICY IF EXISTS storage_delete ON storage.objects;

CREATE POLICY storage_read ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'bim-alazab'
    AND public.is_project_member(
      ((storage.foldername(name))[1])::uuid,
      auth.uid()
    )
  );

CREATE POLICY storage_upload ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'bim-alazab'
    AND public.can_edit_project(
      ((storage.foldername(name))[1])::uuid,
      auth.uid()
    )
  );

CREATE POLICY storage_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'bim-alazab'
    AND public.can_edit_project(
      ((storage.foldername(name))[1])::uuid,
      auth.uid()
    )
  )
  WITH CHECK (
    bucket_id = 'bim-alazab'
    AND public.can_edit_project(
      ((storage.foldername(name))[1])::uuid,
      auth.uid()
    )
  );

CREATE POLICY storage_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'bim-alazab'
    AND public.can_edit_project(
      ((storage.foldername(name))[1])::uuid,
      auth.uid()
    )
  );

-- 5) Remove auto-admin-on-first-signup behavior
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(COALESCE(NEW.email,''), '@', 1)
    ),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'viewer');

  RETURN NEW;
END;
$function$;
