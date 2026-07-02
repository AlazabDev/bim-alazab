import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  ChevronLeft, FolderTree, Layers, Boxes, FileStack, GitBranch,
  Search, Download, ExternalLink, FileText, Image as ImageIcon, Box,
  CheckCircle2, MessageSquare, FileQuestion, FileCheck2, Sparkles, Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  fetchArchive, PHASE_META, DISCIPLINE_META, KIND_META,
  type ArchiveRecord, type Phase, type Discipline, type Kind, type Revision,
} from "@/lib/archive-api";

const KIND_ICON: Record<Kind, typeof FileText> = {
  file: FileText, approval: CheckCircle2, rfi: FileQuestion,
  submittal: FileCheck2, issue: MessageSquare, evidence: Boxes, ai: Sparkles,
};

const CATEGORY_ICON: Record<string, typeof FileText> = {
  bim: Box, drawings: FileText, site_photos: ImageIcon, reports: FileText, documents: FileText,
};

type ExplorerProps = { projectId?: string };

type Level = "project" | "phase" | "discipline" | "kind" | "record";

type Path = {
  project?: { id: string; name: string; code: string };
  phase?: Phase;
  discipline?: Discipline;
  kind?: Kind;
  recordId?: string;
};

export function ArchiveExplorer({ projectId }: ExplorerProps) {
  const [path, setPath] = useState<Path>({});
  const [q, setQ] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["archive", projectId ?? "all"],
    queryFn: () => fetchArchive(projectId),
    staleTime: 30_000,
  });

  const trees = data ?? [];

  // Auto-select the only project when scoped
  const activeProject = useMemo(() => {
    if (path.project) return path.project;
    if (projectId && trees.length === 1) {
      const t = trees[0];
      return { id: t.project_id, name: t.project_name, code: t.project_code };
    }
    return undefined;
  }, [path.project, projectId, trees]);

  const activeRecords = useMemo<ArchiveRecord[]>(() => {
    if (!activeProject) return [];
    return trees.find((t) => t.project_id === activeProject.id)?.records ?? [];
  }, [trees, activeProject]);

  const level: Level = !activeProject ? "project"
    : !path.phase ? "phase"
    : !path.discipline ? "discipline"
    : !path.kind ? "kind"
    : "record";

  const searchFiltered = useMemo(() => {
    if (!q.trim()) return activeRecords;
    const needle = q.trim().toLowerCase();
    return activeRecords.filter((r) =>
      r.title.toLowerCase().includes(needle) ||
      (r.code ?? "").toLowerCase().includes(needle) ||
      (r.meta ?? "").toLowerCase().includes(needle),
    );
  }, [activeRecords, q]);

  const activeRecord = path.recordId ? activeRecords.find((r) => r.id === path.recordId) : undefined;

  if (isLoading) {
    return (
      <Card className="flex min-h-[420px] items-center justify-center p-8 text-muted-foreground">
        <Loader2 className="ml-2 h-4 w-4 animate-spin" /> جارٍ تحميل الأرشيف…
      </Card>
    );
  }
  if (error) {
    return <Card className="p-6 text-sm text-destructive">تعذّر تحميل الأرشيف: {(error as Error).message}</Card>;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]" dir="rtl">
      {/* Sidebar tree */}
      <Card className="h-fit p-3 lg:sticky lg:top-4">
        <div className="mb-2 flex items-center gap-2 border-b border-border px-1 pb-2 text-xs font-bold text-muted-foreground">
          <FolderTree className="h-4 w-4" /> شجرة الأرشيف
        </div>
        <TreeView
          trees={trees}
          projectId={projectId}
          path={path}
          setPath={setPath}
          records={activeRecords}
        />
      </Card>

      {/* Main panel */}
      <div className="min-w-0 space-y-3">
        <Card className="flex flex-wrap items-center gap-2 p-3">
          <Breadcrumbs path={path} setPath={setPath} record={activeRecord} scopedProject={projectId ? activeProject : undefined} />
          <div className="ms-auto flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث في الأرشيف…" className="h-9 w-56 pe-8" />
            </div>
          </div>
        </Card>

        {level === "project" && <ProjectGrid trees={trees} onOpen={(p) => setPath({ project: p })} />}
        {level === "phase" && <PhaseGrid records={searchFiltered} onOpen={(phase) => setPath((s) => ({ ...s, phase }))} />}
        {level === "discipline" && (
          <DisciplineGrid
            records={searchFiltered.filter((r) => r.phase === path.phase)}
            onOpen={(discipline) => setPath((s) => ({ ...s, discipline }))}
          />
        )}
        {level === "kind" && (
          <KindGrid
            records={searchFiltered.filter((r) => r.phase === path.phase && r.discipline === path.discipline)}
            onOpen={(kind) => setPath((s) => ({ ...s, kind }))}
          />
        )}
        {level === "record" && !activeRecord && (
          <RecordList
            records={searchFiltered.filter(
              (r) => r.phase === path.phase && r.discipline === path.discipline && r.kind === path.kind,
            )}
            onOpen={(id) => setPath((s) => ({ ...s, recordId: id }))}
          />
        )}
        {level === "record" && activeRecord && (
          <RecordDetail record={activeRecord} onBack={() => setPath((s) => ({ ...s, recordId: undefined }))} />
        )}
      </div>
    </div>
  );
}

// ── Tree view (left column) ───────────────────────────────────────────────────
function TreeView({
  trees, projectId, path, setPath, records,
}: {
  trees: { project_id: string; project_name: string; project_code: string; records: ArchiveRecord[] }[];
  projectId?: string;
  path: Path;
  setPath: (p: Path) => void;
  records: ArchiveRecord[];
}) {
  return (
    <ul className="space-y-1 text-sm">
      {(projectId ? trees.filter((t) => t.project_id === projectId) : trees).map((t) => {
        const isOpen = path.project?.id === t.project_id || (projectId && trees.length === 1);
        return (
          <li key={t.project_id}>
            <button
              onClick={() => setPath({ project: { id: t.project_id, name: t.project_name, code: t.project_code } })}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-right transition",
                isOpen ? "bg-primary/10 font-bold text-primary" : "hover:bg-accent",
              )}
            >
              <span className="flex items-center gap-2 truncate"><Boxes className="h-4 w-4 opacity-70" /> {t.project_name}</span>
              <span className="text-[10px] text-muted-foreground">{t.records.length}</span>
            </button>
            {isOpen && (
              <PhaseSubtree records={records} path={path} setPath={setPath} />
            )}
          </li>
        );
      })}
      {trees.length === 0 && (
        <li className="rounded-md border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
          لا توجد مشاريع بعد
        </li>
      )}
    </ul>
  );
}

function PhaseSubtree({ records, path, setPath }: { records: ArchiveRecord[]; path: Path; setPath: (p: Path) => void }) {
  const phases = (Object.keys(PHASE_META) as Phase[]);
  return (
    <ul className="mt-1 space-y-0.5 border-r border-border pr-2 ms-1">
      {phases.map((ph) => {
        const count = records.filter((r) => r.phase === ph).length;
        if (!count) return null;
        const open = path.phase === ph;
        return (
          <li key={ph}>
            <button
              onClick={() => setPath({ ...path, phase: ph, discipline: undefined, kind: undefined, recordId: undefined })}
              className={cn("flex w-full items-center justify-between rounded-md px-2 py-1 text-xs transition",
                open ? "bg-accent font-semibold" : "hover:bg-accent/60 text-muted-foreground")}
            >
              <span className="flex items-center gap-1.5"><Layers className="h-3 w-3" /> {PHASE_META[ph].label}</span>
              <span className="text-[10px]">{count}</span>
            </button>
            {open && (
              <ul className="mt-0.5 space-y-0.5 border-r border-border pr-2 ms-1">
                {(Object.keys(DISCIPLINE_META) as Discipline[]).map((d) => {
                  const c = records.filter((r) => r.phase === ph && r.discipline === d).length;
                  if (!c) return null;
                  return (
                    <li key={d}>
                      <button
                        onClick={() => setPath({ ...path, phase: ph, discipline: d, kind: undefined, recordId: undefined })}
                        className={cn("flex w-full items-center justify-between rounded-md px-2 py-1 text-[11px] transition",
                          path.discipline === d ? "bg-primary/10 text-primary font-medium" : "hover:bg-accent/60 text-muted-foreground")}
                      >
                        <span>{DISCIPLINE_META[d].label}</span>
                        <span>{c}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}

// ── Breadcrumbs ───────────────────────────────────────────────────────────────
function Breadcrumbs({ path, setPath, record, scopedProject }: { path: Path; setPath: (p: Path) => void; record?: ArchiveRecord; scopedProject?: { id: string; name: string; code: string } | undefined }) {
  const crumbs: { label: string; onClick?: () => void }[] = [];
  crumbs.push({ label: "الأرشيف", onClick: () => setPath({}) });
  const proj = path.project ?? scopedProject;
  if (proj) crumbs.push({ label: proj.name, onClick: () => setPath({ project: proj }) });
  if (path.phase) crumbs.push({ label: PHASE_META[path.phase].label, onClick: () => setPath({ project: proj, phase: path.phase }) });
  if (path.discipline) crumbs.push({ label: DISCIPLINE_META[path.discipline].label, onClick: () => setPath({ project: proj, phase: path.phase, discipline: path.discipline }) });
  if (path.kind) crumbs.push({ label: KIND_META[path.kind].label, onClick: () => setPath({ project: proj, phase: path.phase, discipline: path.discipline, kind: path.kind }) });
  if (record) crumbs.push({ label: record.title });

  return (
    <nav className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
      {crumbs.map((c, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronLeft className="h-3 w-3 opacity-50" />}
          {c.onClick ? (
            <button onClick={c.onClick} className={cn("rounded px-1.5 py-0.5 hover:bg-accent", i === crumbs.length - 1 && "font-bold text-foreground")}>
              {c.label}
            </button>
          ) : (
            <span className="font-bold text-foreground">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

// ── Level grids ───────────────────────────────────────────────────────────────
function ProjectGrid({ trees, onOpen }: { trees: { project_id: string; project_name: string; project_code: string; records: ArchiveRecord[] }[]; onOpen: (p: { id: string; name: string; code: string }) => void }) {
  if (!trees.length) return <EmptyState title="لا توجد مشاريع" desc="أنشئ مشروعًا لبدء تعبئة الأرشيف." />;
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {trees.map((t) => (
        <button
          key={t.project_id}
          onClick={() => onOpen({ id: t.project_id, name: t.project_name, code: t.project_code })}
          className="group text-right"
        >
          <Card className="h-full p-4 transition group-hover:-translate-y-0.5 group-hover:shadow-elevated">
            <div className="mb-3 flex items-center justify-between">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><Boxes className="h-5 w-5" /></div>
              <Badge variant="outline" className="text-[10px]">{t.project_code}</Badge>
            </div>
            <div className="font-extrabold">{t.project_name}</div>
            <div className="mt-2 flex flex-wrap gap-1 text-[10px]">
              {(Object.keys(PHASE_META) as Phase[]).map((ph) => {
                const c = t.records.filter((r) => r.phase === ph).length;
                if (!c) return null;
                return (
                  <span key={ph} className={cn("rounded-full border px-2 py-0.5", PHASE_META[ph].tone)}>
                    {PHASE_META[ph].label.split(" ")[0]} · {c}
                  </span>
                );
              })}
            </div>
            <div className="mt-3 text-xs text-muted-foreground">إجمالي السجلات: {t.records.length}</div>
          </Card>
        </button>
      ))}
    </div>
  );
}

function PhaseGrid({ records, onOpen }: { records: ArchiveRecord[]; onOpen: (p: Phase) => void }) {
  const phases = (Object.keys(PHASE_META) as Phase[]);
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {phases.map((ph) => {
        const items = records.filter((r) => r.phase === ph);
        return (
          <button key={ph} onClick={() => onOpen(ph)} className="text-right">
            <Card className={cn("h-full p-4 transition hover:-translate-y-0.5 hover:shadow-elevated border-r-4", PHASE_META[ph].tone.replace("border-", "border-r-"))}>
              <div className="flex items-center gap-2 text-primary"><Layers className="h-5 w-5" /><span className="text-xs font-bold text-muted-foreground">مرحلة BIM</span></div>
              <div className="mt-2 text-lg font-black">{PHASE_META[ph].label}</div>
              <div className="text-xs text-muted-foreground">{PHASE_META[ph].hint}</div>
              <div className="mt-3 text-3xl font-black">{items.length}</div>
              <div className="text-[10px] text-muted-foreground">سجل</div>
            </Card>
          </button>
        );
      })}
    </div>
  );
}

function DisciplineGrid({ records, onOpen }: { records: ArchiveRecord[]; onOpen: (d: Discipline) => void }) {
  const active = (Object.keys(DISCIPLINE_META) as Discipline[]).filter((d) => records.some((r) => r.discipline === d));
  if (!active.length) return <EmptyState title="لا توجد تخصصات ضمن هذه المرحلة" />;
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {active.map((d) => {
        const c = records.filter((r) => r.discipline === d).length;
        return (
          <button key={d} onClick={() => onOpen(d)} className="text-right">
            <Card className="h-full p-4 transition hover:-translate-y-0.5 hover:shadow-elevated">
              <div className="mb-3 flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent font-black">{DISCIPLINE_META[d].short}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold">{c}</span>
              </div>
              <div className="font-extrabold">{DISCIPLINE_META[d].label}</div>
              <div className="mt-1 text-[10px] text-muted-foreground">تخصص</div>
            </Card>
          </button>
        );
      })}
    </div>
  );
}

function KindGrid({ records, onOpen }: { records: ArchiveRecord[]; onOpen: (k: Kind) => void }) {
  const active = (Object.keys(KIND_META) as Kind[]).filter((k) => records.some((r) => r.kind === k));
  if (!active.length) return <EmptyState title="لا توجد أنواع سجلات ضمن هذا التخصص" />;
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {active.map((k) => {
        const c = records.filter((r) => r.kind === k).length;
        const Icon = KIND_ICON[k];
        return (
          <button key={k} onClick={() => onOpen(k)} className="text-right">
            <Card className="h-full p-4 transition hover:-translate-y-0.5 hover:shadow-elevated">
              <div className="mb-3 flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold">{c}</span>
              </div>
              <div className="font-extrabold">{KIND_META[k].label}</div>
              <div className="mt-1 text-[10px] text-muted-foreground">نوع سجل</div>
            </Card>
          </button>
        );
      })}
    </div>
  );
}

// ── Records list & detail ─────────────────────────────────────────────────────
function RecordList({ records, onOpen }: { records: ArchiveRecord[]; onOpen: (id: string) => void }) {
  if (!records.length) return <EmptyState title="لا توجد سجلات مطابقة" />;
  return (
    <Card className="divide-y divide-border overflow-hidden">
      {records
        .slice()
        .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
        .map((r) => {
          const Icon = KIND_ICON[r.kind];
          const CatIcon = r.meta && CATEGORY_ICON[r.meta] ? CATEGORY_ICON[r.meta] : Icon;
          return (
            <button key={r.id} onClick={() => onOpen(r.id)} className="flex w-full items-center gap-3 p-3 text-right hover:bg-accent/40">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><CatIcon className="h-4 w-4" /></span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {r.code && <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono">{r.code}</span>}
                  <span className="truncate font-semibold">{r.title}</span>
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                  <span className={cn("rounded-full border px-2 py-0.5", PHASE_META[r.phase].tone)}>{PHASE_META[r.phase].label.split(" ")[0]}</span>
                  <span>{DISCIPLINE_META[r.discipline].label}</span>
                  {r.current_version && <span>الإصدار: {r.current_version}</span>}
                  {r.revisions.length > 0 && <span className="flex items-center gap-1"><GitBranch className="h-3 w-3" />{r.revisions.length}</span>}
                </div>
              </div>
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            </button>
          );
        })}
    </Card>
  );
}

function RecordDetail({ record, onBack }: { record: ArchiveRecord; onBack: () => void }) {
  const Icon = KIND_ICON[record.kind];
  return (
    <div className="space-y-3">
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {record.code && <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono">{record.code}</span>}
                <h3 className="text-lg font-black">{record.title}</h3>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className={cn("rounded-full border px-2 py-0.5", PHASE_META[record.phase].tone)}>{PHASE_META[record.phase].label}</span>
                <span>{DISCIPLINE_META[record.discipline].label}</span>
                <span>{KIND_META[record.kind].label}</span>
                {record.meta && <span className="opacity-70">· {record.meta}</span>}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {record.href && (
              <Button asChild size="sm" variant="outline">
                <Link to={record.href}>فتح التفاصيل <ExternalLink className="mr-1 h-3.5 w-3.5" /></Link>
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={onBack}>رجوع</Button>
          </div>
        </div>
      </Card>

      {record.kind === "file" && (
        <Card className="p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold"><FileStack className="h-4 w-4 text-primary" /> الإصدارات ({record.revisions.length})</div>
          {record.revisions.length === 0 ? (
            <div className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
              لم يتم رفع إصدارات لهذا الملف بعد.
            </div>
          ) : (
            <ol className="relative space-y-3 border-r-2 border-dashed border-border pr-4 ms-2">
              {record.revisions.map((rev: Revision) => (
                <li key={rev.id} className="relative">
                  <span className="absolute -right-[22px] top-1.5 grid h-4 w-4 place-items-center rounded-full bg-primary text-[10px] text-primary-foreground">v</span>
                  <div className="rounded-lg border border-border bg-card p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-bold">الإصدار {rev.version}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {new Date(rev.created_at).toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" })}
                      </div>
                    </div>
                    {rev.notes && <div className="mt-1 text-xs text-muted-foreground">{rev.notes}</div>}
                    <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                      {rev.size_bytes != null && <span>{(rev.size_bytes / 1024).toFixed(1)} KB</span>}
                      {rev.storage_path && (
                        <Button size="sm" variant="ghost" className="h-6 px-2 text-[11px]">
                          <Download className="ml-1 h-3 w-3" /> تنزيل
                        </Button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Card>
      )}
    </div>
  );
}

function EmptyState({ title, desc }: { title: string; desc?: string }) {
  return (
    <Card className="flex min-h-[240px] flex-col items-center justify-center gap-2 p-6 text-center">
      <FolderTree className="h-8 w-8 text-muted-foreground/50" />
      <div className="text-sm font-semibold">{title}</div>
      {desc && <div className="text-xs text-muted-foreground">{desc}</div>}
    </Card>
  );
}
