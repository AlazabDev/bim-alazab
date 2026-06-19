import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  ArrowLeft,
  ClipboardList,
  Droplets,
  FileCheck2,
  Inbox,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { fetchProjects } from "@/lib/projects-api";
import {
  createPlumbingCheck,
  createPlumbingFixture,
  createTechnicalEvidence,
  deletePlumbingFixture,
  fetchPlumbingChecks,
  fetchPlumbingFixtures,
  updatePlumbingFixture,
  type CheckStatus,
  type CheckType,
  type PlumbingCheck,
  type PlumbingFixture,
} from "@/lib/technical-evidence-api";

export const Route = createFileRoute("/plumbing-system")({
  head: () => ({ meta: [{ title: "نظام السباكة — Alazab BIM" }] }),
  component: PlumbingSystemPage,
});

const checkTypeLabels: Record<CheckType, string> = {
  water_demand: "Water Demand",
  pipe_velocity: "Pipe Velocity",
  drainage_slope: "Drainage Slope",
  cleanout: "Cleanout Control",
  riser: "Riser Review",
  shaft: "Shaft Coordination",
};

const checkStatusMeta: Record<CheckStatus, { label: string; className: string }> = {
  draft: { label: "مسودة", className: "bg-muted text-muted-foreground border-border" },
  pass: { label: "ناجح", className: "bg-success/15 text-success border-success/30" },
  warning: {
    label: "تحذير",
    className: "bg-warning/15 text-warning-foreground border-warning/30",
  },
  fail: {
    label: "فاشل",
    className: "bg-destructive/15 text-destructive border-destructive/30",
  },
  approved: { label: "معتمد", className: "bg-success/15 text-success border-success/30" },
};

function PlumbingSystemPage() {
  const projectsQuery = useQuery({ queryKey: ["projects"], queryFn: fetchProjects });
  const [projectId, setProjectId] = useState<string>("");

  // Auto-pick first project on load
  if (!projectId && projectsQuery.data && projectsQuery.data.length > 0) {
    setProjectId(projectsQuery.data[0].id);
  }

  return (
    <AppShell>
      <PageHeader
        title="نظام السباكة المخصص"
        description="حصر الأجهزة، تجميع نقاط التغذية والصرف، وتشغيل مراجعات أقطار وميول مبدئية"
        badge={
          <Badge variant="outline" className="border-primary/25 bg-primary/10 text-primary">
            Custom Plumbing Layer
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            <div className="w-56">
              <Select value={projectId} onValueChange={setProjectId}>
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
            {projectId && <CreatePlumbingEvidenceButton projectId={projectId} />}
          </div>
        }
      />

      {!projectId && (
        <Card className="p-10 text-center text-muted-foreground">
          اختر مشروعًا للبدء.
        </Card>
      )}

      {projectId && (
        <>
          <FixturesSection projectId={projectId} />
          <ChecksSection projectId={projectId} />
        </>
      )}

      <Card className="mt-4 flex items-center justify-between p-4">
        <div className="text-sm text-muted-foreground">
          هذه الطبقة تخدم Plumbing Evidence داخل المشروع.
        </div>
        <Button asChild variant="outline">
          <Link to="/technical-evidence">
            الأدلة الفنية <ArrowLeft className="mr-2 h-4 w-4" />
          </Link>
        </Button>
      </Card>
    </AppShell>
  );
}

// ----- Fixtures -----

function FixturesSection({ projectId }: { projectId: string }) {
  const qc = useQueryClient();
  const fixturesQuery = useQuery({
    queryKey: ["plumbing-fixtures", projectId],
    queryFn: () => fetchPlumbingFixtures(projectId),
  });

  const totals = useMemo(() => {
    const list = fixturesQuery.data ?? [];
    return {
      count: list.reduce((s, f) => s + (f.quantity ?? 0), 0),
      water: list.reduce(
        (s, f) => s + (Number(f.water_fixture_units) || 0) * (f.quantity ?? 1),
        0,
      ),
      drain: list.reduce(
        (s, f) => s + (Number(f.drainage_fixture_units) || 0) * (f.quantity ?? 1),
        0,
      ),
      hot: list.filter((f) => f.hot_water).length,
      drainReq: list.filter((f) => f.drain_required).length,
    };
  }, [fixturesQuery.data]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePlumbingFixture(id),
    onSuccess: () => {
      toast.success("تم الحذف");
      qc.invalidateQueries({ queryKey: ["plumbing-fixtures", projectId] });
    },
    onError: (e: Error) => toast.error("فشل الحذف", { description: e.message }),
  });

  const stats = [
    { label: "إجمالي الأجهزة", value: totals.count },
    { label: "Water Fixture Units", value: totals.water.toFixed(1) },
    { label: "Drainage Fixture Units", value: totals.drain.toFixed(1) },
    { label: "تحتاج ماء ساخن", value: totals.hot },
    { label: "تحتاج صرف", value: totals.drainReq },
  ];

  return (
    <section className="mt-4 grid gap-4">
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <Droplets className="mb-3 h-5 w-5 text-primary" />
            <div className="text-2xl font-black tabular-nums">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="flex items-center gap-2 font-bold">
              <ClipboardList className="h-4 w-4" /> Fixture Schedule
            </h3>
            <p className="text-xs text-muted-foreground">
              حصر الأجهزة الصحية لكل فراغ
            </p>
          </div>
          <FixtureDialog projectId={projectId} />
        </div>

        {fixturesQuery.isLoading && (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="ms-2 h-4 w-4 animate-spin" /> جاري التحميل...
          </div>
        )}
        {fixturesQuery.isError && (
          <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" /> تعذّر تحميل البيانات.
          </div>
        )}
        {fixturesQuery.data && fixturesQuery.data.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 p-10 text-center text-muted-foreground">
            <Inbox className="h-8 w-8" />
            <div className="font-bold">لا توجد أجهزة بعد</div>
            <div className="text-xs">ابدأ بإضافة Fixture جديد.</div>
          </div>
        )}
        {fixturesQuery.data && fixturesQuery.data.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  <th className="p-3 text-right">الفراغ</th>
                  <th className="p-3 text-right">الجهاز</th>
                  <th className="p-3 text-right">الكمية</th>
                  <th className="p-3 text-right">التغذية</th>
                  <th className="p-3 text-right">قطر الصرف</th>
                  <th className="p-3 text-right">WFU</th>
                  <th className="p-3 text-right">DFU</th>
                  <th className="p-3 text-right">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {fixturesQuery.data.map((row) => (
                  <tr key={row.id} className="border-t border-border">
                    <td className="p-3 font-semibold">{row.space_name}</td>
                    <td className="p-3">{row.fixture_type}</td>
                    <td className="p-3 tabular-nums">{row.quantity}</td>
                    <td className="p-3 text-muted-foreground">
                      {[row.hot_water && "حار", row.cold_water && "بارد"]
                        .filter(Boolean)
                        .join(" / ") || "—"}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {row.drain_required
                        ? `${row.drain_diameter_mm ?? "—"} mm`
                        : "—"}
                    </td>
                    <td className="p-3 tabular-nums">
                      {row.water_fixture_units ?? "—"}
                    </td>
                    <td className="p-3 tabular-nums">
                      {row.drainage_fixture_units ?? "—"}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <FixtureDialog projectId={projectId} fixture={row} />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm(`حذف ${row.fixture_type}؟`)) {
                              deleteMutation.mutate(row.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </section>
  );
}

function FixtureDialog({
  projectId,
  fixture,
}: {
  projectId: string;
  fixture?: PlumbingFixture;
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    space_name: fixture?.space_name ?? "",
    fixture_type: fixture?.fixture_type ?? "",
    quantity: fixture?.quantity ?? 1,
    cold_water: fixture?.cold_water ?? true,
    hot_water: fixture?.hot_water ?? false,
    drain_required: fixture?.drain_required ?? true,
    drain_diameter_mm: fixture?.drain_diameter_mm ?? 50,
    water_fixture_units: fixture?.water_fixture_units ?? 1,
    drainage_fixture_units: fixture?.drainage_fixture_units ?? 1,
    notes: fixture?.notes ?? "",
  });

  const isEdit = Boolean(fixture);

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        project_id: projectId,
        evidence_id: fixture?.evidence_id ?? null,
        space_name: form.space_name.trim(),
        fixture_type: form.fixture_type.trim(),
        quantity: Number(form.quantity) || 1,
        cold_water: form.cold_water,
        hot_water: form.hot_water,
        drain_required: form.drain_required,
        drain_diameter_mm: form.drain_required
          ? Number(form.drain_diameter_mm) || null
          : null,
        water_fixture_units: Number(form.water_fixture_units) || null,
        drainage_fixture_units: Number(form.drainage_fixture_units) || null,
        notes: form.notes || null,
      };
      return isEdit
        ? updatePlumbingFixture(fixture!.id, payload)
        : createPlumbingFixture(payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? "تم التحديث" : "تمت الإضافة");
      qc.invalidateQueries({ queryKey: ["plumbing-fixtures", projectId] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error("فشل الحفظ", { description: e.message }),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="ms-1 h-4 w-4" /> إضافة Fixture
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "تعديل Fixture" : "إضافة Fixture"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>الفراغ</Label>
            <Input
              value={form.space_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, space_name: e.target.value }))
              }
              placeholder="WC, Pantry, Service..."
            />
          </div>
          <div className="space-y-1.5">
            <Label>نوع الجهاز</Label>
            <Input
              value={form.fixture_type}
              onChange={(e) =>
                setForm((f) => ({ ...f, fixture_type: e.target.value }))
              }
              placeholder="Water Closet, Wash Basin..."
            />
          </div>
          <div className="space-y-1.5">
            <Label>الكمية</Label>
            <Input
              type="number"
              min={1}
              value={form.quantity}
              onChange={(e) =>
                setForm((f) => ({ ...f, quantity: Number(e.target.value) }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>قطر الصرف (مم)</Label>
            <Input
              type="number"
              min={0}
              value={form.drain_diameter_mm}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  drain_diameter_mm: Number(e.target.value),
                }))
              }
              disabled={!form.drain_required}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Water Fixture Units</Label>
            <Input
              type="number"
              step="0.1"
              value={form.water_fixture_units}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  water_fixture_units: Number(e.target.value),
                }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Drainage Fixture Units</Label>
            <Input
              type="number"
              step="0.1"
              value={form.drainage_fixture_units}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  drainage_fixture_units: Number(e.target.value),
                }))
              }
            />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border p-3">
            <Label>ماء بارد</Label>
            <Switch
              checked={form.cold_water}
              onCheckedChange={(v) => setForm((f) => ({ ...f, cold_water: v }))}
            />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border p-3">
            <Label>ماء ساخن</Label>
            <Switch
              checked={form.hot_water}
              onCheckedChange={(v) => setForm((f) => ({ ...f, hot_water: v }))}
            />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border p-3 md:col-span-2">
            <Label>يحتاج صرف</Label>
            <Switch
              checked={form.drain_required}
              onCheckedChange={(v) =>
                setForm((f) => ({ ...f, drain_required: v }))
              }
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>ملاحظات</Label>
            <Textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            إلغاء
          </Button>
          <Button
            disabled={
              !form.space_name.trim() ||
              !form.fixture_type.trim() ||
              mutation.isPending
            }
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
            حفظ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ----- Checks -----

function ChecksSection({ projectId }: { projectId: string }) {
  const checksQuery = useQuery({
    queryKey: ["plumbing-checks", projectId],
    queryFn: () => fetchPlumbingChecks(projectId),
  });

  return (
    <section className="mt-4">
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold">Plumbing Checks</h3>
            <p className="text-xs text-muted-foreground">
              تخزين منظم لحسابات السباكة (input / result) لربطها لاحقًا بمنطق الحساب الكامل
            </p>
          </div>
          <CheckDialog projectId={projectId} />
        </div>

        {checksQuery.isLoading && (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="ms-2 h-4 w-4 animate-spin" /> جاري التحميل...
          </div>
        )}
        {checksQuery.data && checksQuery.data.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 p-10 text-center text-muted-foreground">
            <Inbox className="h-8 w-8" />
            <div className="font-bold">لا توجد فحوصات بعد</div>
          </div>
        )}
        {checksQuery.data && checksQuery.data.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  <th className="p-3 text-right">النوع</th>
                  <th className="p-3 text-right">الحالة</th>
                  <th className="p-3 text-right">ملاحظات</th>
                  <th className="p-3 text-right">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {checksQuery.data.map((c: PlumbingCheck) => {
                  const s = checkStatusMeta[c.status];
                  return (
                    <tr key={c.id} className="border-t border-border">
                      <td className="p-3 font-semibold">
                        {checkTypeLabels[c.check_type]}
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className={s.className}>
                          {s.label}
                        </Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">{c.notes ?? "—"}</td>
                      <td className="p-3 text-muted-foreground">
                        {new Date(c.created_at).toLocaleDateString("ar-EG")}
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
  );
}

function CheckDialog({ projectId }: { projectId: string }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    check_type: "water_demand" as CheckType,
    status: "draft" as CheckStatus,
    notes: "",
    input_json: "{}",
    result_json: "{}",
  });

  const mutation = useMutation({
    mutationFn: () => {
      let input: Record<string, unknown> = {};
      let result: Record<string, unknown> = {};
      try {
        input = JSON.parse(form.input_json || "{}");
        result = JSON.parse(form.result_json || "{}");
      } catch {
        throw new Error("JSON غير صالح في input_data أو result_data");
      }
      return createPlumbingCheck({
        project_id: projectId,
        check_type: form.check_type,
        status: form.status,
        notes: form.notes || null,
        input_data: input,
        result_data: result,
      });
    },
    onSuccess: () => {
      toast.success("تم إنشاء الفحص");
      qc.invalidateQueries({ queryKey: ["plumbing-checks", projectId] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error("فشل الحفظ", { description: e.message }),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="ms-1 h-4 w-4" /> إنشاء Check
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>إنشاء Plumbing Check</DialogTitle>
          <DialogDescription>
            يتم تخزين input/result كـ JSON. المنطق الهندسي سيتم ربطه لاحقًا.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>نوع الفحص</Label>
            <Select
              value={form.check_type}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, check_type: v as CheckType }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(checkTypeLabels) as CheckType[]).map((k) => (
                  <SelectItem key={k} value={k}>
                    {checkTypeLabels[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>الحالة</Label>
            <Select
              value={form.status}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, status: v as CheckStatus }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(checkStatusMeta) as CheckStatus[]).map((k) => (
                  <SelectItem key={k} value={k}>
                    {checkStatusMeta[k].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Input Data (JSON)</Label>
            <Textarea
              rows={4}
              value={form.input_json}
              onChange={(e) =>
                setForm((f) => ({ ...f, input_json: e.target.value }))
              }
              className="font-mono text-xs"
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Result Data (JSON)</Label>
            <Textarea
              rows={4}
              value={form.result_json}
              onChange={(e) =>
                setForm((f) => ({ ...f, result_json: e.target.value }))
              }
              className="font-mono text-xs"
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>ملاحظات</Label>
            <Textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            إلغاء
          </Button>
          <Button
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
            حفظ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreatePlumbingEvidenceButton({ projectId }: { projectId: string }) {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: () =>
      createTechnicalEvidence({
        project_id: projectId,
        discipline: "plumbing",
        evidence_type: "plumbing_report",
        title: `Plumbing Evidence — ${new Date().toLocaleDateString("ar-EG")}`,
        source_software: "Custom Plumbing System",
        report_version: "v1.0",
        status: "draft",
      }),
    onSuccess: () => {
      toast.success("تم إنشاء سجل Plumbing Evidence");
      qc.invalidateQueries({ queryKey: ["technical-evidence"] });
    },
    onError: (e: Error) => toast.error("فشل الإنشاء", { description: e.message }),
  });
  return (
    <Button
      variant="outline"
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? (
        <Loader2 className="ms-1 h-4 w-4 animate-spin" />
      ) : (
        <FileCheck2 className="ms-1 h-4 w-4" />
      )}
      Create Plumbing Evidence
    </Button>
  );
}
