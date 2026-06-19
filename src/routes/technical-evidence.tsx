import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  ClipboardCheck,
  Database,
  Droplets,
  FileCheck2,
  Gauge,
  Inbox,
  Lightbulb,
  Loader2,
  Upload,
  Wind,
} from "lucide-react";
import { fetchProjects } from "@/lib/projects-api";
import {
  createTechnicalEvidence,
  fetchTechnicalEvidence,
  type Discipline,
  type EvidenceStatus,
  type TechnicalEvidence,
} from "@/lib/technical-evidence-api";

export const Route = createFileRoute("/technical-evidence")({
  head: () => ({ meta: [{ title: "الأدلة الفنية — Alazab BIM" }] }),
  component: TechnicalEvidencePage,
});

const disciplineMeta: Record<
  Discipline,
  { label: string; icon: typeof Droplets; colorClass: string }
> = {
  plumbing: { label: "السباكة", icon: Droplets, colorClass: "text-sky-600 bg-sky-500/10" },
  hvac: { label: "التكييف والتهوية", icon: Wind, colorClass: "text-emerald-600 bg-emerald-500/10" },
  lighting: { label: "الإضاءة", icon: Lightbulb, colorClass: "text-amber-600 bg-amber-500/10" },
};

const statusMeta: Record<EvidenceStatus, { label: string; className: string }> = {
  draft: { label: "مسودة", className: "bg-muted text-muted-foreground border-border" },
  in_review: {
    label: "تحت المراجعة",
    className: "bg-warning/15 text-warning-foreground border-warning/30",
  },
  approved: { label: "معتمد", className: "bg-success/15 text-success border-success/30" },
  rejected: {
    label: "مرفوض",
    className: "bg-destructive/15 text-destructive border-destructive/30",
  },
};

function TechnicalEvidencePage() {
  const evidenceQuery = useQuery({
    queryKey: ["technical-evidence"],
    queryFn: () => fetchTechnicalEvidence(),
  });

  const counts = useMemo(() => {
    const list = evidenceQuery.data ?? [];
    return {
      total: list.length,
      hvac: list.filter((e) => e.discipline === "hvac").length,
      lighting: list.filter((e) => e.discipline === "lighting").length,
      plumbing: list.filter((e) => e.discipline === "plumbing").length,
      inReview: list.filter((e) => e.status === "in_review").length,
      approved: list.filter((e) => e.status === "approved").length,
    };
  }, [evidenceQuery.data]);

  const readiness = counts.total
    ? Math.round((counts.approved / counts.total) * 100)
    : 0;

  const summaryCards = [
    { label: "إجمالي التقارير", value: counts.total, icon: Database },
    { label: "تحت المراجعة", value: counts.inReview, icon: ClipboardCheck },
    { label: "معتمدة", value: counts.approved, icon: FileCheck2 },
    { label: "نسبة الاعتماد", value: `${readiness}%`, icon: Gauge },
  ];

  return (
    <AppShell>
      <PageHeader
        title="الأدلة الفنية"
        description="ربط تقارير السباكة والتكييف والإضاءة بالمشروع ومسار الاعتماد والتسليم"
        actions={<NewEvidenceDialog />}
      />

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="relative overflow-hidden p-6 shadow-card">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--color-primary)/12,transparent_35%),radial-gradient(circle_at_bottom_right,var(--color-accent)/10,transparent_30%)]" />
          <div className="relative">
            <Badge
              className="mb-4 border-primary/25 bg-primary/10 text-primary"
              variant="outline"
            >
              Technical Evidence Layer
            </Badge>
            <h2 className="text-2xl font-black md:text-3xl">
              من التقرير الفني إلى قرار الاعتماد
            </h2>
            <p className="mt-3 max-w-3xl leading-8 text-muted-foreground">
              تجمع هذه الصفحة مخرجات برامج الحسابات الفنية مثل HAP وDIALux وأنظمة السباكة،
              ثم تربط كل تقرير بالمشروع والتخصص والإصدار وحالة المراجعة.
            </p>
            <div className="mt-5 max-w-xl">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-bold">نسبة الاعتماد العامة</span>
                <span className="font-black text-primary">{readiness}%</span>
              </div>
              <Progress value={readiness} className="h-2" />
            </div>
          </div>
        </Card>

        <Card className="p-5 shadow-card">
          <h3 className="mb-4 font-bold">ملخص سريع</h3>
          <div className="grid grid-cols-2 gap-3">
            {summaryCards.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-border bg-muted/25 p-4"
              >
                <item.icon className="mb-3 h-5 w-5 text-primary" />
                <div className="text-2xl font-black tabular-nums">{item.value}</div>
                <div className="text-xs text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-3">
        {(Object.keys(disciplineMeta) as Discipline[]).map((d) => {
          const meta = disciplineMeta[d];
          const list = (evidenceQuery.data ?? []).filter((e) => e.discipline === d);
          const approved = list.filter((e) => e.status === "approved").length;
          const ratio = list.length ? Math.round((approved / list.length) * 100) : 0;
          const Icon = meta.icon;
          return (
            <Card key={d} className="flex flex-col p-5 shadow-card">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div
                  className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${meta.colorClass}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <Badge variant="outline">
                  {list.length} تقرير
                </Badge>
              </div>
              <h3 className="text-xl font-black">{meta.label}</h3>
              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-bold">نسبة الاعتماد</span>
                  <span className="font-black text-primary">{ratio}%</span>
                </div>
                <Progress value={ratio} className="h-2" />
              </div>
              <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                <div>معتمد: {approved}</div>
                <div>
                  تحت المراجعة: {list.filter((e) => e.status === "in_review").length}
                </div>
                <div>
                  مسودة: {list.filter((e) => e.status === "draft").length}
                </div>
              </div>
            </Card>
          );
        })}
      </section>

      <section className="mt-4">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold">آخر التقارير</h3>
              <p className="text-xs text-muted-foreground">
                سجل Technical Evidence المرتبط بالمشاريع
              </p>
            </div>
          </div>

          {evidenceQuery.isLoading && (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="ms-2 h-4 w-4 animate-spin" /> جاري التحميل...
            </div>
          )}

          {evidenceQuery.isError && (
            <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              تعذّر تحميل التقارير. تحقق من الاتصال وأعد المحاولة.
            </div>
          )}

          {evidenceQuery.data && evidenceQuery.data.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 p-10 text-center text-muted-foreground">
              <Inbox className="h-8 w-8" />
              <div className="font-bold">لا توجد تقارير بعد</div>
              <div className="text-xs">ابدأ بإضافة تقرير فني من زر «رفع تقرير».</div>
            </div>
          )}

          {evidenceQuery.data && evidenceQuery.data.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs text-muted-foreground">
                  <tr>
                    <th className="p-3 text-right">العنوان</th>
                    <th className="p-3 text-right">التخصص</th>
                    <th className="p-3 text-right">النوع</th>
                    <th className="p-3 text-right">البرنامج</th>
                    <th className="p-3 text-right">الإصدار</th>
                    <th className="p-3 text-right">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {evidenceQuery.data.map((row: TechnicalEvidence) => {
                    const s = statusMeta[row.status];
                    const d = disciplineMeta[row.discipline];
                    return (
                      <tr key={row.id} className="border-t border-border">
                        <td className="p-3 font-semibold">{row.title}</td>
                        <td className="p-3 text-muted-foreground">{d.label}</td>
                        <td className="p-3 text-muted-foreground">{row.evidence_type}</td>
                        <td className="p-3 text-muted-foreground">
                          {row.source_software ?? "—"}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {row.report_version ?? "—"}
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className={s.className}>
                            {s.label}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </section>
    </AppShell>
  );
}

function NewEvidenceDialog() {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const projectsQuery = useQuery({ queryKey: ["projects"], queryFn: fetchProjects });

  const [form, setForm] = useState({
    project_id: "",
    discipline: "plumbing" as Discipline,
    evidence_type: "plumbing_report",
    title: "",
    source_software: "",
    report_version: "v1.0",
    description: "",
    status: "draft" as EvidenceStatus,
    decision_notes: "",
  });

  const mutation = useMutation({
    mutationFn: () =>
      createTechnicalEvidence({
        project_id: form.project_id,
        discipline: form.discipline,
        evidence_type: form.evidence_type,
        title: form.title.trim(),
        source_software: form.source_software || null,
        report_version: form.report_version || null,
        description: form.description || null,
        status: form.status,
        decision_notes: form.decision_notes || null,
      }),
    onSuccess: () => {
      toast.success("تم حفظ التقرير الفني");
      qc.invalidateQueries({ queryKey: ["technical-evidence"] });
      setOpen(false);
      setForm((f) => ({ ...f, title: "", description: "", decision_notes: "" }));
    },
    onError: (err: Error) => toast.error("فشل الحفظ", { description: err.message }),
  });

  const canSubmit = form.project_id && form.title.trim() && form.evidence_type;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="ms-1 h-4 w-4" /> رفع تقرير
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>إضافة تقرير فني جديد</DialogTitle>
          <DialogDescription>
            سيتم ربط التقرير بالمشروع المحدد ضمن طبقة Technical Evidence.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>المشروع</Label>
            <Select
              value={form.project_id}
              onValueChange={(v) => setForm((f) => ({ ...f, project_id: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر مشروع" />
              </SelectTrigger>
              <SelectContent>
                {(projectsQuery.data ?? []).map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>التخصص</Label>
            <Select
              value={form.discipline}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, discipline: v as Discipline }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hvac">HVAC</SelectItem>
                <SelectItem value="lighting">Lighting</SelectItem>
                <SelectItem value="plumbing">Plumbing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>نوع التقرير</Label>
            <Input
              value={form.evidence_type}
              onChange={(e) =>
                setForm((f) => ({ ...f, evidence_type: e.target.value }))
              }
              placeholder="load_report, lux_report, plumbing_report..."
            />
          </div>

          <div className="space-y-1.5">
            <Label>عنوان التقرير</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="مثال: تقرير الأحمال الحرارية - الدور الأرضي"
            />
          </div>

          <div className="space-y-1.5">
            <Label>البرنامج المصدر</Label>
            <Input
              value={form.source_software}
              onChange={(e) =>
                setForm((f) => ({ ...f, source_software: e.target.value }))
              }
              placeholder="Carrier HAP 4.9, DIALux evo, Custom Plumbing"
            />
          </div>

          <div className="space-y-1.5">
            <Label>إصدار التقرير</Label>
            <Input
              value={form.report_version}
              onChange={(e) =>
                setForm((f) => ({ ...f, report_version: e.target.value }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label>الحالة</Label>
            <Select
              value={form.status}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, status: v as EvidenceStatus }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">مسودة</SelectItem>
                <SelectItem value="in_review">تحت المراجعة</SelectItem>
                <SelectItem value="approved">معتمد</SelectItem>
                <SelectItem value="rejected">مرفوض</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label>وصف التقرير</Label>
            <Textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label>ملاحظات الاعتماد</Label>
            <Textarea
              rows={2}
              value={form.decision_notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, decision_notes: e.target.value }))
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            إلغاء
          </Button>
          <Button
            disabled={!canSubmit || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
            حفظ التقرير
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
