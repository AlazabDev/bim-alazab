
-- Technical Evidence
CREATE TABLE public.technical_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  discipline text NOT NULL CHECK (discipline IN ('hvac','lighting','plumbing')),
  evidence_type text NOT NULL,
  title text NOT NULL,
  description text,
  source_software text,
  report_version text DEFAULT 'v1.0',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','in_review','approved','rejected')),
  prepared_by uuid REFERENCES auth.users(id),
  reviewed_by uuid REFERENCES auth.users(id),
  approved_by uuid REFERENCES auth.users(id),
  decision_notes text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.technical_evidence TO authenticated;
GRANT ALL ON public.technical_evidence TO service_role;
ALTER TABLE public.technical_evidence ENABLE ROW LEVEL SECURITY;
CREATE POLICY te_select ON public.technical_evidence FOR SELECT TO authenticated
  USING (public.is_project_member(project_id, auth.uid()));
CREATE POLICY te_insert ON public.technical_evidence FOR INSERT TO authenticated
  WITH CHECK (public.can_edit_project(project_id, auth.uid()));
CREATE POLICY te_update ON public.technical_evidence FOR UPDATE TO authenticated
  USING (public.can_edit_project(project_id, auth.uid()))
  WITH CHECK (public.can_edit_project(project_id, auth.uid()));
CREATE POLICY te_delete ON public.technical_evidence FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_te_updated BEFORE UPDATE ON public.technical_evidence
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_te_project ON public.technical_evidence(project_id);
CREATE INDEX idx_te_discipline ON public.technical_evidence(discipline);

-- Technical Evidence Files
CREATE TABLE public.technical_evidence_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evidence_id uuid NOT NULL REFERENCES public.technical_evidence(id) ON DELETE CASCADE,
  file_id uuid REFERENCES public.files(id) ON DELETE SET NULL,
  storage_path text,
  file_name text,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.technical_evidence_files TO authenticated;
GRANT ALL ON public.technical_evidence_files TO service_role;
ALTER TABLE public.technical_evidence_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY tef_select ON public.technical_evidence_files FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.technical_evidence te
    WHERE te.id = evidence_id AND public.is_project_member(te.project_id, auth.uid())
  ));
CREATE POLICY tef_insert ON public.technical_evidence_files FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.technical_evidence te
    WHERE te.id = evidence_id AND public.can_edit_project(te.project_id, auth.uid())
  ));
CREATE POLICY tef_update ON public.technical_evidence_files FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.technical_evidence te
    WHERE te.id = evidence_id AND public.can_edit_project(te.project_id, auth.uid())
  ));
CREATE POLICY tef_delete ON public.technical_evidence_files FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_tef_evidence ON public.technical_evidence_files(evidence_id);

-- Plumbing Fixtures
CREATE TABLE public.plumbing_fixtures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  evidence_id uuid REFERENCES public.technical_evidence(id) ON DELETE SET NULL,
  space_name text NOT NULL,
  fixture_type text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  cold_water boolean DEFAULT false,
  hot_water boolean DEFAULT false,
  drain_required boolean DEFAULT true,
  drain_diameter_mm integer,
  water_fixture_units numeric,
  drainage_fixture_units numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plumbing_fixtures TO authenticated;
GRANT ALL ON public.plumbing_fixtures TO service_role;
ALTER TABLE public.plumbing_fixtures ENABLE ROW LEVEL SECURITY;
CREATE POLICY pf_select ON public.plumbing_fixtures FOR SELECT TO authenticated
  USING (public.is_project_member(project_id, auth.uid()));
CREATE POLICY pf_insert ON public.plumbing_fixtures FOR INSERT TO authenticated
  WITH CHECK (public.can_edit_project(project_id, auth.uid()));
CREATE POLICY pf_update ON public.plumbing_fixtures FOR UPDATE TO authenticated
  USING (public.can_edit_project(project_id, auth.uid()))
  WITH CHECK (public.can_edit_project(project_id, auth.uid()));
CREATE POLICY pf_delete ON public.plumbing_fixtures FOR DELETE TO authenticated
  USING (public.can_edit_project(project_id, auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_pf_updated BEFORE UPDATE ON public.plumbing_fixtures
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_pf_project ON public.plumbing_fixtures(project_id);

-- Plumbing Checks
CREATE TABLE public.plumbing_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  evidence_id uuid REFERENCES public.technical_evidence(id) ON DELETE SET NULL,
  check_type text NOT NULL CHECK (check_type IN ('water_demand','pipe_velocity','drainage_slope','cleanout','riser','shaft')),
  input_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  result_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','pass','warning','fail','approved')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plumbing_checks TO authenticated;
GRANT ALL ON public.plumbing_checks TO service_role;
ALTER TABLE public.plumbing_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY pc_select ON public.plumbing_checks FOR SELECT TO authenticated
  USING (public.is_project_member(project_id, auth.uid()));
CREATE POLICY pc_insert ON public.plumbing_checks FOR INSERT TO authenticated
  WITH CHECK (public.can_edit_project(project_id, auth.uid()));
CREATE POLICY pc_update ON public.plumbing_checks FOR UPDATE TO authenticated
  USING (public.can_edit_project(project_id, auth.uid()))
  WITH CHECK (public.can_edit_project(project_id, auth.uid()));
CREATE POLICY pc_delete ON public.plumbing_checks FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_pc_updated BEFORE UPDATE ON public.plumbing_checks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_pc_project ON public.plumbing_checks(project_id);
