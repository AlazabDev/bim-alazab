
-- 1) Drop permissive public SELECT policy on storage.objects (bim-alazab bucket)
DROP POLICY IF EXISTS public_fetch_bim_alazab ON storage.objects;

-- 2) Restrict notifications INSERT: remove direct user insert; only service_role may insert.
DROP POLICY IF EXISTS notif_insert_self ON public.notifications;

-- 3) Tighten clients SELECT: only admins or project members with elevated project_role
DROP POLICY IF EXISTS clients_select_auth ON public.clients;
CREATE POLICY clients_select_auth ON public.clients
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.project_members pm ON pm.project_id = p.id
      WHERE p.client_id = clients.id
        AND pm.user_id = auth.uid()
        AND pm.project_role IN ('admin','owner','editor')
    )
  );
