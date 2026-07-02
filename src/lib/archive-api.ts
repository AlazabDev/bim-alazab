import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type FileCategory = Database["public"]["Enums"]["file_category"];
export type FileStatus = Database["public"]["Enums"]["file_status"];
export type IssueType = Database["public"]["Enums"]["issue_type"];

// ── BIM CDE-inspired phases derived from status enums ─────────────────────────
export type Phase = "wip" | "shared" | "published" | "archived";

export const PHASE_META: Record<Phase, { label: string; hint: string; tone: string }> = {
  wip:       { label: "قيد الإعداد (WIP)",     hint: "مسودات وأعمال جارية",        tone: "bg-muted text-muted-foreground border-border" },
  shared:    { label: "مشترك (Shared)",         hint: "قيد المراجعة أو التنسيق",    tone: "bg-warning/15 text-warning border-warning/30" },
  published: { label: "منشور (Published)",      hint: "معتمد للتنفيذ أو التسليم",   tone: "bg-success/15 text-success border-success/30" },
  archived:  { label: "أرشيف (Archived)",       hint: "مرفوض / مؤرشف / تاريخي",      tone: "bg-destructive/10 text-destructive border-destructive/30" },
};

export const filePhase = (status: FileStatus | string | null | undefined): Phase => {
  switch (status) {
    case "draft": return "wip";
    case "in_review": return "shared";
    case "approved": return "published";
    case "rejected": return "archived";
    default: return "wip";
  }
};

// ── Discipline derivation ─────────────────────────────────────────────────────
export type Discipline =
  | "architecture" | "structure" | "mep" | "hvac" | "plumbing" | "electrical"
  | "site" | "documents" | "general";

export const DISCIPLINE_META: Record<Discipline, { label: string; short: string }> = {
  architecture: { label: "العمارة",     short: "AR" },
  structure:    { label: "الإنشائي",    short: "ST" },
  mep:          { label: "MEP عام",     short: "MEP" },
  hvac:         { label: "التكييف HVAC", short: "HV" },
  plumbing:     { label: "السباكة",      short: "PL" },
  electrical:   { label: "الكهرباء",     short: "EL" },
  site:         { label: "الموقع",        short: "ST" },
  documents:    { label: "مستندات إدارية", short: "DOC" },
  general:      { label: "عام",           short: "GEN" },
};

const disciplineFromCategory = (c: FileCategory | string | null | undefined): Discipline => {
  switch (c) {
    case "bim": return "general";
    case "drawings": return "architecture";
    case "site_photos": return "site";
    case "reports": return "documents";
    case "documents": return "documents";
    default: return "general";
  }
};

const disciplineFromText = (raw?: string | null): Discipline => {
  const s = (raw ?? "").toLowerCase();
  if (/(hvac|تكييف|hap)/i.test(s)) return "hvac";
  if (/(plumb|سباك)/i.test(s)) return "plumbing";
  if (/(elec|كهرب|light|إضاءة|اضاءة)/i.test(s)) return "electrical";
  if (/(struct|إنشائي|انشائي)/i.test(s)) return "structure";
  if (/(archi|عمار)/i.test(s)) return "architecture";
  if (/(mep|ميكا)/i.test(s)) return "mep";
  if (/(site|موقع)/i.test(s)) return "site";
  return "general";
};

// ── Record kind (Type) ────────────────────────────────────────────────────────
export type Kind = "file" | "approval" | "rfi" | "submittal" | "issue" | "evidence" | "ai";

export const KIND_META: Record<Kind, { label: string; short: string }> = {
  file:      { label: "ملفات ونماذج", short: "FIL" },
  approval:  { label: "اعتمادات",      short: "APR" },
  rfi:       { label: "استفسارات RFI", short: "RFI" },
  submittal: { label: "معتمدات",        short: "SUB" },
  issue:     { label: "قضايا",           short: "ISS" },
  evidence:  { label: "أدلة فنية",       short: "EVD" },
  ai:        { label: "تحليلات AI",      short: "AI"  },
};

// ── Unified archive record ────────────────────────────────────────────────────
export type Revision = {
  id: string;
  version: string;
  created_at: string;
  size_bytes: number | null;
  notes: string | null;
  storage_path: string | null;
};

export type ArchiveRecord = {
  id: string;
  kind: Kind;
  title: string;
  code: string | null;
  project_id: string;
  phase: Phase;
  discipline: Discipline;
  status: string;
  updated_at: string;
  meta: string | null;             // secondary line (category / type / discipline)
  current_version: string | null;
  revisions: Revision[];           // only for files
  href?: string;                    // detail route
};

export type ArchiveTree = {
  project_id: string;
  project_name: string;
  project_code: string;
  records: ArchiveRecord[];
};

// ── Fetch ─────────────────────────────────────────────────────────────────────
export async function fetchArchive(projectId?: string): Promise<ArchiveTree[]> {
  const projQ = supabase.from("projects").select("id, name, code").order("created_at", { ascending: false });
  const { data: projects, error: pe } = projectId ? await projQ.eq("id", projectId) : await projQ;
  if (pe) throw pe;
  if (!projects?.length) return [];

  const ids = projects.map((p) => p.id);

  const [filesRes, versionsRes, apprRes, issRes, evRes] = await Promise.all([
    supabase.from("files").select("*").in("project_id", ids),
    supabase.from("file_versions").select("*").in("file_id",
      // subquery via IN needs file ids — fetch after; use a separate call
      // placeholder empty array to keep call parallel; refine after
      []
    ),
    supabase.from("approvals").select("id, project_id, step_name, status, updated_at, comment, role_required").in("project_id", ids),
    supabase.from("issues").select("id, code, project_id, title, type, status, priority, updated_at, description").in("project_id", ids),
    supabase.from("technical_evidence").select("id, project_id, title, evidence_type, discipline, status, updated_at, report_version, description").in("project_id", ids),
  ]);

  if (filesRes.error) throw filesRes.error;
  if (apprRes.error) throw apprRes.error;
  if (issRes.error) throw issRes.error;
  if (evRes.error) throw evRes.error;

  const files = filesRes.data ?? [];
  const fileIds = files.map((f) => f.id);
  let versions: NonNullable<typeof versionsRes.data> = [];
  if (fileIds.length) {
    const { data, error } = await supabase.from("file_versions").select("*").in("file_id", fileIds);
    if (error) throw error;
    versions = data ?? [];
  }
  const versionsByFile = new Map<string, Revision[]>();
  for (const v of versions) {
    const list = versionsByFile.get(v.file_id) ?? [];
    list.push({ id: v.id, version: v.version, created_at: v.created_at, size_bytes: v.size_bytes, notes: v.notes, storage_path: v.storage_path });
    versionsByFile.set(v.file_id, list);
  }
  for (const list of versionsByFile.values()) list.sort((a, b) => b.created_at.localeCompare(a.created_at));

  const records: ArchiveRecord[] = [];

  // Files
  for (const f of files) {
    records.push({
      id: f.id,
      kind: "file",
      title: f.name,
      code: null,
      project_id: f.project_id,
      phase: filePhase(f.status),
      discipline: disciplineFromCategory(f.category),
      status: f.status,
      updated_at: f.updated_at,
      meta: f.category,
      current_version: f.current_version,
      revisions: versionsByFile.get(f.id) ?? [],
      href: `/files/${f.id}`,
    });
  }

  // Approvals
  for (const a of apprRes.data ?? []) {
    records.push({
      id: a.id,
      kind: "approval",
      title: a.step_name,
      code: null,
      project_id: a.project_id,
      phase: a.status === "approved" ? "published" : a.status === "rejected" ? "archived" : a.status === "pending" ? "shared" : "wip",
      discipline: disciplineFromText(a.role_required ?? a.step_name),
      status: a.status,
      updated_at: a.updated_at,
      meta: a.role_required,
      current_version: null,
      revisions: [],
      href: `/approvals/${a.id}`,
    });
  }

  // Issues / RFIs / Submittals
  for (const i of issRes.data ?? []) {
    const kind: Kind = i.type === "rfi" ? "rfi" : i.type === "submittal" ? "submittal" : "issue";
    records.push({
      id: i.id,
      kind,
      title: i.title,
      code: i.code,
      project_id: i.project_id,
      phase: i.status === "closed" ? "archived" : i.status === "resolved" ? "published" : i.status === "in_progress" ? "shared" : "wip",
      discipline: disciplineFromText(i.title + " " + (i.description ?? "")),
      status: i.status,
      updated_at: i.updated_at,
      meta: i.priority,
      current_version: null,
      revisions: [],
      href: kind === "rfi" ? `/rfis/${i.id}` : kind === "submittal" ? `/submittals/${i.id}` : `/issues/${i.id}`,
    });
  }

  // Technical evidence (also treated as AI/analysis when metadata indicates)
  for (const e of evRes.data ?? []) {
    const isAi = /ai|ذكاء|تحليل/i.test((e.evidence_type ?? "") + " " + (e.title ?? ""));
    records.push({
      id: e.id,
      kind: isAi ? "ai" : "evidence",
      title: e.title,
      code: null,
      project_id: e.project_id,
      phase: e.status === "approved" ? "published" : e.status === "rejected" ? "archived" : e.status === "in_review" ? "shared" : "wip",
      discipline: disciplineFromText(e.discipline ?? e.evidence_type ?? ""),
      status: e.status,
      updated_at: e.updated_at,
      meta: e.evidence_type,
      current_version: e.report_version,
      revisions: [],
      href: `/technical-evidence`,
    });
  }

  return projects.map((p) => ({
    project_id: p.id,
    project_name: p.name,
    project_code: p.code,
    records: records.filter((r) => r.project_id === p.id),
  }));
}
