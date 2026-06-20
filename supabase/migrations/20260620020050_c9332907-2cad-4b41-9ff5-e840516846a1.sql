
-- Clients: restrict ALL management to admins only
DROP POLICY IF EXISTS clients_admin_manage ON public.clients;
CREATE POLICY clients_admin_manage ON public.clients
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Approvals: allow project editors (and admins) to delete
DROP POLICY IF EXISTS approvals_delete_editor ON public.approvals;
CREATE POLICY approvals_delete_editor ON public.approvals
  FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.can_edit_project(project_id, auth.uid())
  );

-- File versions: allow editors of the parent file's project to delete
DROP POLICY IF EXISTS file_versions_delete_editor ON public.file_versions;
CREATE POLICY file_versions_delete_editor ON public.file_versions
  FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.files f
      WHERE f.id = file_versions.file_id
        AND public.can_edit_project(f.project_id, auth.uid())
    )
  );

-- Notifications: users can delete their own
DROP POLICY IF EXISTS notif_delete_own ON public.notifications;
CREATE POLICY notif_delete_own ON public.notifications
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
