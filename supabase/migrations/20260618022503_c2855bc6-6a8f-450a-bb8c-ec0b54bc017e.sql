-- =========================================================
-- 1. ENUMS
-- =========================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'owner', 'editor', 'viewer');
CREATE TYPE public.project_status AS ENUM ('draft', 'in_review', 'in_progress', 'approved', 'completed', 'rejected');
CREATE TYPE public.file_category AS ENUM ('site_photos', 'bim', 'drawings', 'reports', 'documents');
CREATE TYPE public.file_status AS ENUM ('draft', 'in_review', 'approved', 'rejected');
CREATE TYPE public.issue_type AS ENUM ('issue', 'rfi', 'submittal');
CREATE TYPE public.issue_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE public.issue_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.approval_status AS ENUM ('waiting', 'pending', 'approved', 'rejected');
CREATE TYPE public.activity_type AS ENUM ('upload', 'approve', 'reject', 'comment', 'edit', 'create', 'delete', 'invite');
CREATE TYPE public.notif_type AS ENUM ('info', 'success', 'warning', 'danger');

-- =========================================================
-- 2. UTILITY FUNCTIONS
-- =========================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- =========================================================
-- 3. PROFILES
-- =========================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT,
  avatar_url TEXT,
  phone TEXT,
  job_title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- 4. USER ROLES + has_role
-- =========================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "user_roles_select_own_or_admin" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "user_roles_admin_manage" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- 5. AUTO PROFILE + FIRST-USER-IS-ADMIN
-- =========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  user_count INTEGER;
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(COALESCE(NEW.email,''), '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );

  SELECT COUNT(*) INTO user_count FROM auth.users;
  IF user_count = 1 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'viewer');
  END IF;

  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- 6. CLIENTS
-- =========================================================
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  location TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clients_select_auth" ON public.clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "clients_admin_manage" ON public.clients FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'editor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'editor'));
CREATE TRIGGER trg_clients_updated BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- 7. PROJECTS
-- =========================================================
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  location TEXT,
  description TEXT,
  status public.project_status NOT NULL DEFAULT 'draft',
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  conformity INTEGER NOT NULL DEFAULT 0 CHECK (conformity >= 0 AND conformity <= 100),
  start_date DATE,
  due_date DATE,
  manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_projects_updated BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- 8. PROJECT MEMBERS
-- =========================================================
CREATE TABLE public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_role public.app_role NOT NULL DEFAULT 'viewer',
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);
CREATE INDEX idx_project_members_user ON public.project_members(user_id);
CREATE INDEX idx_project_members_project ON public.project_members(project_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_members TO authenticated;
GRANT ALL ON public.project_members TO service_role;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_project_member(_project UUID, _user UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.project_members WHERE project_id = _project AND user_id = _user)
      OR public.has_role(_user, 'admin');
$$;

CREATE OR REPLACE FUNCTION public.can_edit_project(_project UUID, _user UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user, 'admin') OR EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_id = _project AND user_id = _user
      AND project_role IN ('admin','owner','editor')
  );
$$;

CREATE POLICY "pm_select" ON public.project_members FOR SELECT TO authenticated
  USING (public.is_project_member(project_id, auth.uid()));
CREATE POLICY "pm_admin_manage" ON public.project_members FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Now projects policies (after helper exists)
CREATE POLICY "projects_select_member" ON public.projects FOR SELECT TO authenticated
  USING (public.is_project_member(id, auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "projects_insert_editors" ON public.projects FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "projects_update_editors" ON public.projects FOR UPDATE TO authenticated
  USING (public.can_edit_project(id, auth.uid())) WITH CHECK (public.can_edit_project(id, auth.uid()));
CREATE POLICY "projects_delete_admin" ON public.projects FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- 9. FILES + VERSIONS
-- =========================================================
CREATE TABLE public.files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category public.file_category NOT NULL DEFAULT 'documents',
  storage_path TEXT,
  size_bytes BIGINT DEFAULT 0,
  mime_type TEXT,
  current_version TEXT DEFAULT 'v1.0',
  status public.file_status NOT NULL DEFAULT 'draft',
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.files TO authenticated;
GRANT ALL ON public.files TO service_role;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "files_select_member" ON public.files FOR SELECT TO authenticated
  USING (public.is_project_member(project_id, auth.uid()));
CREATE POLICY "files_insert_editor" ON public.files FOR INSERT TO authenticated
  WITH CHECK (public.can_edit_project(project_id, auth.uid()));
CREATE POLICY "files_update_editor" ON public.files FOR UPDATE TO authenticated
  USING (public.can_edit_project(project_id, auth.uid())) WITH CHECK (public.can_edit_project(project_id, auth.uid()));
CREATE POLICY "files_delete_editor" ON public.files FOR DELETE TO authenticated
  USING (public.can_edit_project(project_id, auth.uid()));
CREATE TRIGGER trg_files_updated BEFORE UPDATE ON public.files FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.file_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  storage_path TEXT,
  size_bytes BIGINT DEFAULT 0,
  notes TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.file_versions TO authenticated;
GRANT ALL ON public.file_versions TO service_role;
ALTER TABLE public.file_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fv_select" ON public.file_versions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.files f WHERE f.id = file_id AND public.is_project_member(f.project_id, auth.uid())));
CREATE POLICY "fv_insert" ON public.file_versions FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.files f WHERE f.id = file_id AND public.can_edit_project(f.project_id, auth.uid())));

-- =========================================================
-- 10. ISSUES (issues + rfi + submittal)
-- =========================================================
CREATE TABLE public.issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type public.issue_type NOT NULL DEFAULT 'issue',
  status public.issue_status NOT NULL DEFAULT 'open',
  priority public.issue_priority NOT NULL DEFAULT 'medium',
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.issues TO authenticated;
GRANT ALL ON public.issues TO service_role;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "issues_select_member" ON public.issues FOR SELECT TO authenticated
  USING (public.is_project_member(project_id, auth.uid()));
CREATE POLICY "issues_insert_editor" ON public.issues FOR INSERT TO authenticated
  WITH CHECK (public.can_edit_project(project_id, auth.uid()));
CREATE POLICY "issues_update_editor" ON public.issues FOR UPDATE TO authenticated
  USING (public.can_edit_project(project_id, auth.uid())) WITH CHECK (public.can_edit_project(project_id, auth.uid()));
CREATE POLICY "issues_delete_editor" ON public.issues FOR DELETE TO authenticated
  USING (public.can_edit_project(project_id, auth.uid()));
CREATE TRIGGER trg_issues_updated BEFORE UPDATE ON public.issues FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- 11. APPROVALS
-- =========================================================
CREATE TABLE public.approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  file_id UUID REFERENCES public.files(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL DEFAULT 1,
  step_name TEXT NOT NULL,
  role_required TEXT,
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status public.approval_status NOT NULL DEFAULT 'waiting',
  comment TEXT,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.approvals TO authenticated;
GRANT ALL ON public.approvals TO service_role;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "approvals_select_member" ON public.approvals FOR SELECT TO authenticated
  USING (public.is_project_member(project_id, auth.uid()));
CREATE POLICY "approvals_insert_editor" ON public.approvals FOR INSERT TO authenticated
  WITH CHECK (public.can_edit_project(project_id, auth.uid()));
CREATE POLICY "approvals_update_assignee_or_editor" ON public.approvals FOR UPDATE TO authenticated
  USING (assignee_id = auth.uid() OR public.can_edit_project(project_id, auth.uid()))
  WITH CHECK (assignee_id = auth.uid() OR public.can_edit_project(project_id, auth.uid()));
CREATE TRIGGER trg_approvals_updated BEFORE UPDATE ON public.approvals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- 12. ACTIVITIES
-- =========================================================
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type public.activity_type NOT NULL,
  description TEXT NOT NULL,
  target TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_activities_project ON public.activities(project_id, created_at DESC);
GRANT SELECT, INSERT ON public.activities TO authenticated;
GRANT ALL ON public.activities TO service_role;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activities_select_member" ON public.activities FOR SELECT TO authenticated
  USING (project_id IS NULL OR public.is_project_member(project_id, auth.uid()));
CREATE POLICY "activities_insert_auth" ON public.activities FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- =========================================================
-- 13. NOTIFICATIONS
-- =========================================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  type public.notif_type NOT NULL DEFAULT 'info',
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, read, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif_select_own" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "notif_update_own" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notif_insert_self" ON public.notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- =========================================================
-- 14. SEED CLIENTS + PROJECTS
-- =========================================================
INSERT INTO public.clients (name, contact_email, location) VALUES
  ('مجموعة العزب القابضة', 'info@alazab.com', 'الرياض'),
  ('شركة الواحة العقارية', 'projects@oasis.sa', 'جدة'),
  ('وزارة الصحة', 'projects@moh.gov.sa', 'الدمام'),
  ('مؤسسة المستقبل التعليمية', 'info@future-edu.sa', 'الرياض');

INSERT INTO public.projects (code, name, client_id, location, description, status, progress, conformity, start_date, due_date) VALUES
  ('ALZ-2026-012', 'برج العزب التجاري',
    (SELECT id FROM public.clients WHERE name = 'مجموعة العزب القابضة'),
    'الرياض - حي الملقا',
    'برج مكاتب من 24 طابقًا مع بدروم خدمي وواجهة زجاجية ثنائية الطبقات.',
    'in_progress', 68, 92, '2026-01-12', '2027-04-30'),
  ('ALZ-2026-018', 'مجمع الواحة السكني',
    (SELECT id FROM public.clients WHERE name = 'شركة الواحة العقارية'),
    'جدة - حي الشاطئ',
    'مجمع سكني يضم 6 أبراج بإجمالي 320 وحدة سكنية ومرافق ترفيهية.',
    'in_review', 34, 88, '2026-03-01', '2027-09-15'),
  ('ALZ-2025-091', 'مستشفى الأمل التخصصي',
    (SELECT id FROM public.clients WHERE name = 'وزارة الصحة'),
    'الدمام',
    'مستشفى بسعة 280 سرير مع وحدات تخصصية ومركز طوارئ.',
    'approved', 100, 97, '2024-06-10', '2026-05-20'),
  ('ALZ-2026-024', 'مدرسة المستقبل الدولية',
    (SELECT id FROM public.clients WHERE name = 'مؤسسة المستقبل التعليمية'),
    'الرياض - حي العارض',
    'مدرسة دولية تستوعب 1200 طالب مع ملاعب رياضية ومسرح.',
    'draft', 8, 0, '2026-05-01', '2027-08-31');