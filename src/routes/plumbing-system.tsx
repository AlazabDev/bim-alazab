import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  ArrowLeft,
  Calculator,
  CheckCircle2,
  ClipboardList,
  Droplets,
  FileCheck2,
  Gauge,
  GitBranch,
  Layers3,
  Plus,
  Ruler,
  Settings2,
  Upload,
  Waves,
} from "lucide-react";

export const Route = createFileRoute("/plumbing-system")({
  head: () => ({ meta: [{ title: "نظام السباكة المخصص — Alazab BIM" }] }),
  component: PlumbingSystemPage,
});

type PlumbingStatus = "ready" | "review" | "next";

type PlumbingModule = {
  title: string;
  description: string;
  icon: typeof Droplets;
  readiness: number;
  status: PlumbingStatus;
  inputs: string[];
  outputs: string[];
};

const statusMap: Record<PlumbingStatus, { label: string; className: string }> = {
  ready: { label: "جاهز أوليًا", className: "bg-success/15 text-success border-success/30" },
  review: { label: "تحت الضبط", className: "bg-warning/15 text-warning-foreground border-warning/30" },
  next: { label: "مرحلة تالية", className: "bg-muted text-muted-foreground border-border" },
};

const modules: PlumbingModule[] = [
  {
    title: "Fixture Schedule",
    description: "حصر الأجهزة الصحية ونقاط التغذية والصرف لكل فراغ.",
    icon: ClipboardList,
    readiness: 72,
    status: "ready",
    inputs: ["Space", "Fixture type", "Quantity", "Hot/Cold water", "Drain point"],
    outputs: ["Fixture count", "Water demand", "Drainage demand", "Review notes"],
  },
  {
    title: "Water Supply",
    description: "تجميع نقاط التغذية وحساب أقطار مبدئية ومسارات الضغط.",
    icon: Droplets,
    readiness: 55,
    status: "review",
    inputs: ["Fixture units", "Pressure source", "Pipe material", "Allowed velocity"],
    outputs: ["Pipe size", "Flow estimate", "Pressure note", "Valve schedule"],
  },
  {
    title: "Drainage & Slopes",
    description: "مراجعة الصرف والميول ونقاط التنظيف وربطها بالتقرير الفني.",
    icon: Waves,
    readiness: 50,
    status: "review",
    inputs: ["Drainage units", "Pipe run", "Slope", "Cleanout spacing"],
    outputs: ["Slope check", "Pipe size", "Cleanout list", "Risk notes"],
  },
  {
    title: "Risers & Shafts",
    description: "تتبع الرايزرات والشفتات وربطها بالأدوار والملفات.",
    icon: GitBranch,
    readiness: 35,
    status: "next",
    inputs: ["Floor", "Riser code", "Shaft size", "Connected fixtures"],
    outputs: ["Riser schedule", "Coordination notes", "Clash risk"],
  },
];

const calculationRules = [
  { label: "Water Demand", rule: "Fixture units → Estimated flow → Pipe sizing" },
  { label: "Pipe Velocity", rule: "Check against allowed velocity by pipe material" },
  { label: "Drainage Slope", rule: "Pipe diameter + route length + minimum slope" },
  { label: "Cleanout Control", rule: "Direction changes + spacing + access requirement" },
  { label: "Evidence Output", rule: "Every check produces a report record with revision and status" },
];

const fixtureRows = [
  { space: "WC", fixture: "Water Closet", supply: "Cold", drain: "110 mm", status: "مطلوب" },
  { space: "WC", fixture: "Wash Basin", supply: "Hot / Cold", drain: "50 mm", status: "مطلوب" },
  { space: "Pantry", fixture: "Kitchen Sink", supply: "Hot / Cold", drain: "75 mm", status: "مراجعة" },
  { space: "Service", fixture: "Floor Drain", supply: "-", drain: "75 mm", status: "مطلوب" },
];

const reportFields = [
  "Project Code",
  "Branch / Site",
  "Plumbing Zone",
  "Fixture Schedule",
  "Water Supply Summary",
  "Drainage Summary",
  "Pipe Material",
  "Design Assumptions",
  "Reviewer",
  "Approval Status",
];

function PlumbingSystemPage() {
  const readiness = Math.round(modules.reduce((total, item) => total + item.readiness, 0) / modules.length);

  return (
    <AppShell>
      <PageHeader
        title="نظام السباكة المخصص"
        description="طبقة حساب ومراجعة داخلية للسباكة بدل الاعتماد الكامل على برنامج خارجي في المرحلة الأولى"
        badge={<Badge variant="outline" className="bg-primary/10 text-primary border-primary/25">Custom Plumbing Layer</Badge>}
        actions={
          <>
            <Button variant="outline">
              <Upload className="ms-1 h-4 w-4" /> رفع تقرير
            </Button>
            <Button>
              <Plus className="ms-1 h-4 w-4" /> سجل سباكة جديد
            </Button>
          </>
        }
      />

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="relative overflow-hidden p-6 shadow-card">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--color-primary)/12,transparent_35%),radial-gradient(circle_at_bottom_right,var(--color-accent)/10,transparent_30%)]" />
          <div className="relative">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              <Droplets className="h-4 w-4" />
              Plumbing calculation evidence
            </div>
            <h2 className="text-2xl font-black md:text-3xl">نظام سباكة مخصص للعزب</h2>
            <p className="mt-3 max-w-3xl leading-8 text-muted-foreground">
              النظام يبدأ كقالب حساب ومراجعة: يحصر الأجهزة الصحية، يجمع نقاط التغذية والصرف، ينتج مراجعات أقطار وميول مبدئية، ثم يربط النتيجة بسجل Technical Evidence داخل المشروع.
            </p>
            <div className="mt-5 max-w-xl">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-bold">جاهزية النظام المخصص</span>
                <span className="font-black text-primary">{readiness}%</span>
              </div>
              <Progress value={readiness} className="h-2" />
            </div>
          </div>
        </Card>

        <Card className="p-5 shadow-card">
          <h3 className="mb-4 font-bold">قرار التصميم</h3>
          <div className="space-y-3 text-sm leading-7 text-muted-foreground">
            <p>
              يتم اعتبار البرامج الخارجية مثل CYPEPLUMBING مصدرًا اختياريًا، وليس شرطًا لتشغيل طبقة السباكة.
            </p>
            <p>
              المسار الأساسي داخل Alazab BIM هو قالب سباكة مخصص ينتج Evidence قابل للمراجعة والاعتماد.
            </p>
          </div>
          <div className="mt-4 rounded-xl border border-success/25 bg-success/10 p-3 text-sm font-bold text-success">
            <CheckCircle2 className="ms-2 inline h-4 w-4" />
            Plumbing = Custom Evidence System first
          </div>
        </Card>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-4">
        {modules.map((item) => {
          const Icon = item.icon;
          const meta = statusMap[item.status];
          return (
            <Card key={item.title} className="p-5 shadow-card">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <Badge variant="outline" className={meta.className}>{meta.label}</Badge>
              </div>
              <h3 className="font-black">{item.title}</h3>
              <p className="mt-2 min-h-16 text-sm leading-7 text-muted-foreground">{item.description}</p>
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-bold">جاهزية</span>
                  <span className="font-black text-primary">{item.readiness}%</span>
                </div>
                <Progress value={item.readiness} className="h-2" />
              </div>
              <MiniList title="Inputs" items={item.inputs} />
              <MiniList title="Outputs" items={item.outputs} />
            </Card>
          );
        })}
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <h3 className="font-bold">منطق الحساب والمراجعة</h3>
          </div>
          <div className="space-y-3">
            {calculationRules.map((item, index) => (
              <div key={item.label} className="flex gap-3 rounded-xl border border-border bg-muted/20 p-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-xs font-black text-primary-foreground">
                  {index + 1}
                </div>
                <div>
                  <div className="font-bold">{item.label}</div>
                  <div className="text-xs leading-6 text-muted-foreground">{item.rule}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold">Fixture Schedule مبدئي</h3>
              <p className="text-xs text-muted-foreground">بداية قالب الحصر قبل ربط قاعدة البيانات</p>
            </div>
            <Ruler className="h-5 w-5 text-primary" />
          </div>
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  <th className="p-3 text-right">الفراغ</th>
                  <th className="p-3 text-right">الجهاز</th>
                  <th className="p-3 text-right">التغذية</th>
                  <th className="p-3 text-right">الصرف</th>
                  <th className="p-3 text-right">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {fixtureRows.map((row) => (
                  <tr key={`${row.space}-${row.fixture}`} className="border-t border-border">
                    <td className="p-3 font-semibold">{row.space}</td>
                    <td className="p-3">{row.fixture}</td>
                    <td className="p-3 text-muted-foreground">{row.supply}</td>
                    <td className="p-3 text-muted-foreground">{row.drain}</td>
                    <td className="p-3">
                      <Badge variant="secondary" className="rounded-md text-[11px]">{row.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <FileCheck2 className="h-5 w-5 text-primary" />
            <h3 className="font-bold">قالب تقرير السباكة</h3>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {reportFields.map((field) => (
              <div key={field} className="rounded-xl border border-border bg-muted/25 p-3 text-sm font-semibold">
                {field}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            <h3 className="font-bold">المرحلة التالية</h3>
          </div>
          <div className="space-y-3">
            {[
              "إنشاء جدول plumbing_evidence في Supabase",
              "إنشاء جدول plumbing_fixtures لحصر الأجهزة",
              "ربط زر سجل سباكة جديد بفورم إدخال",
              "تصدير PDF Report من بيانات النظام",
              "ربط التقرير بحالة Approval داخل المشروع",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-xl border border-border bg-card p-3 text-sm">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <Button asChild variant="outline" className="mt-4 w-full">
            <Link to="/technical-evidence">
              العودة إلى الأدلة الفنية <ArrowLeft className="mr-2 h-4 w-4" />
            </Link>
          </Button>
        </Card>
      </section>
    </AppShell>
  );
}

function MiniList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-4">
      <div className="mb-2 text-xs font-black text-muted-foreground">{title}</div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <Badge key={item} variant="secondary" className="rounded-md text-[10px]">
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}
