import { supabase } from "@/integrations/supabase/client";

// Loose-typed client (types regenerate after migrations land in CI).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

export type Discipline = "hvac" | "lighting" | "plumbing";
export type EvidenceStatus = "draft" | "in_review" | "approved" | "rejected";
export type CheckType =
  | "water_demand"
  | "pipe_velocity"
  | "drainage_slope"
  | "cleanout"
  | "riser"
  | "shaft";
export type CheckStatus = "draft" | "pass" | "warning" | "fail" | "approved";

export type TechnicalEvidence = {
  id: string;
  project_id: string;
  discipline: Discipline;
  evidence_type: string;
  title: string;
  description: string | null;
  source_software: string | null;
  report_version: string | null;
  status: EvidenceStatus;
  prepared_by: string | null;
  reviewed_by: string | null;
  approved_by: string | null;
  decision_notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type TechnicalEvidenceInput = {
  project_id: string;
  discipline: Discipline;
  evidence_type: string;
  title: string;
  description?: string | null;
  source_software?: string | null;
  report_version?: string | null;
  status?: EvidenceStatus;
  decision_notes?: string | null;
  metadata?: Record<string, unknown>;
};

export type PlumbingFixture = {
  id: string;
  project_id: string;
  evidence_id: string | null;
  space_name: string;
  fixture_type: string;
  quantity: number;
  cold_water: boolean;
  hot_water: boolean;
  drain_required: boolean;
  drain_diameter_mm: number | null;
  water_fixture_units: number | null;
  drainage_fixture_units: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type PlumbingFixtureInput = Omit<
  PlumbingFixture,
  "id" | "created_at" | "updated_at"
> & { id?: string };

export type PlumbingCheck = {
  id: string;
  project_id: string;
  evidence_id: string | null;
  check_type: CheckType;
  input_data: Record<string, unknown>;
  result_data: Record<string, unknown>;
  status: CheckStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type PlumbingCheckInput = {
  project_id: string;
  evidence_id?: string | null;
  check_type: CheckType;
  input_data?: Record<string, unknown>;
  result_data?: Record<string, unknown>;
  status?: CheckStatus;
  notes?: string | null;
};

// ----- Technical Evidence -----

export async function fetchTechnicalEvidence(projectId?: string) {
  let q = sb
    .from("technical_evidence")
    .select("*")
    .order("created_at", { ascending: false });
  if (projectId) q = q.eq("project_id", projectId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as TechnicalEvidence[];
}

export async function fetchTechnicalEvidenceByDiscipline(discipline: Discipline) {
  const { data, error } = await sb
    .from("technical_evidence")
    .select("*")
    .eq("discipline", discipline)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as TechnicalEvidence[];
}

export async function createTechnicalEvidence(payload: TechnicalEvidenceInput) {
  const { data: { user } } = await sb.auth.getUser();
  const insert = { ...payload, prepared_by: user?.id ?? null };
  const { data, error } = await sb
    .from("technical_evidence")
    .insert(insert)
    .select("*")
    .single();
  if (error) throw error;
  return data as TechnicalEvidence;
}

export async function updateTechnicalEvidence(
  id: string,
  payload: Partial<TechnicalEvidenceInput>,
) {
  const { data, error } = await sb
    .from("technical_evidence")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as TechnicalEvidence;
}

// ----- Plumbing Fixtures -----

export async function fetchPlumbingFixtures(projectId: string) {
  const { data, error } = await sb
    .from("plumbing_fixtures")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PlumbingFixture[];
}

export async function createPlumbingFixture(payload: PlumbingFixtureInput) {
  const { data, error } = await sb
    .from("plumbing_fixtures")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data as PlumbingFixture;
}

export async function updatePlumbingFixture(
  id: string,
  payload: Partial<PlumbingFixtureInput>,
) {
  const { data, error } = await sb
    .from("plumbing_fixtures")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as PlumbingFixture;
}

export async function deletePlumbingFixture(id: string) {
  const { error } = await sb.from("plumbing_fixtures").delete().eq("id", id);
  if (error) throw error;
}

// ----- Plumbing Checks -----

export async function fetchPlumbingChecks(projectId: string) {
  const { data, error } = await sb
    .from("plumbing_checks")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PlumbingCheck[];
}

export async function createPlumbingCheck(payload: PlumbingCheckInput) {
  const { data, error } = await sb
    .from("plumbing_checks")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data as PlumbingCheck;
}
