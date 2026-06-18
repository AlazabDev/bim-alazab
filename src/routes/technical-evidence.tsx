import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  ClipboardCheck,
  Database,
  Droplets,
  FileCheck2,
  Gauge,
  Lightbulb,
  Upload,
  Wind,
} from "lucide-react";

export const Route = createFileRoute("/technical-evidence")({
  head: () => ({ meta: [{ title: "الأدلة الفنية — Alazab BIM" }] }),
  component: TechnicalEvidencePage,
});

type EvidenceStatus = "approved" | "review" | "missing";

type EvidenceDiscipline = {
  key: string;
  title: string;
  subtitle: string;
  icon: typeof Droplets;
  readiness: number;
  status: EvidenceStatus;
  colorClass: string;
  software: string[];
  requiredInputs: string[];
  outputs: string[];
  openItems: string[];
};

const disciplines: EvidenceDiscipline[] = [
  {
    key: "plumbing",
    title: "السباكة",
    subtitle: "تغذية المياه، الصرف، الميول، المخارج، ونقاط التفتيش",
    icon: Droplets,
    readiness: 38,
    status: "review",
    colorClass: "text-sky-600 bg-sky-500/10",
    software: ["CYPEPLUMBING", "Water Systems", "Sanitary Systems", "PDF Evidence"],
    requiredInputs: ["Fixture schedule", "Water supply points", "Drainage points", "Pipe routes", "Slope requirements"],
    outputs: ["Pipe sizing report", "Drainage slope check", "Pressure / flow notes", "Sanitary fixture schedule"],
    openItems: ["تثبيت برنامج الحسابات", "تجهيز قالب تقرير السباكة", "ربط النتائج بالمشروع"],
  },
  {
    key: "hvac",
    title: "التكييف والتهوية",
    subtitle: "أحمال حرارية، تهوية، زونات، معدات، ومسارات تنسيق MEP",
    icon: Wind,
    readiness: 82,
    status: "approved",
    colorClass: "text-emerald-600 bg-emerald-500/10",
    software: ["Carrier HAP", "Load Reports", "Equipment Schedule", "Coordination Notes"],
    requiredInputs: ["Areas", "Occupancy", "Envelope data", "Operation schedule", "Fresh air criteria"],
    outputs: ["Cooling load report", "Ventilation summary", "Equipment schedule", "Design assumptions"],
    openItems: ["توحيد اسم التقرير", "ربط التقرير بالإصدار", "إضافة توقيع المراجعة"],
  },
  {
    key: "lighting",
    title: "الإضاءة",
    subtitle: "Lux levels، توزيع الكشافات، المشاهد، ومطابقة المتطلبات",
    icon: Lightbulb,
    readiness: 76,
    status: "approved",
    colorClass: "text-amber-600 bg-amber-500/10",
    software: ["DIALux evo", "Lux Report", "Luminaire Schedule", "Scene Notes"],
    requiredInputs: ["Room names", "Ceiling height", "Reflectance", "Fixture type", "Target lux"],
    outputs: ["Lux calculation", "False color map", "Luminaire schedule", "Compliance summary"],
    openItems: ["إضافة قالب الملخص", "ربط صور التقرير", "مراجعة target lux لكل فراغ"],
  },
];

const statusMeta: Record<EvidenceStatus, { label: string; className: string }> = {
  approved: { label: "جاهز أوليًا", className: "bg-success/15 text-success border-success/30" },
  review: { label: "تحت التجهيز", className: "bg-warning/15 text-warning-foreground border-warning/30" },
  missing: { label: "ناقص", className: "bg-destructive/15 text-destructive border-destructive/30" },
};

const workflow = [
  { title: "استلام المدخلات", description: "المشروع، التخصص، المساحات، المتطلبات، والملفات المرجعية" },
  { title: "تشغيل برنامج الحساب", description: "HAP أو DIALux أو نظام السباكة المناسب حسب التخصص" },
  { title: "رفع التقرير", description: "PDF أو Excel أو صور نتائج مرتبطة بالمشروع والإصدار" },
  { title: "مراجعة واعتماد", description: "تعليق، رفض، اعتماد، أو طلب مراجعة فنية" },
  { title: "ربط بالتسليم", description: "يدخل التقرير ضمن سجل As-Built و O&M عند التسليم" },
];

const summaryCards = [
  { label: "تخصصات فنية", value: "3", icon: Database },
  { label: "تقارير مطلوبة", value: "12", icon: FileCheck2 },
  { label: "بنود مفتوحة", value: "9", icon: AlertTriangle },
  { label: "جاهزية عامة", value: "65%", icon: Gauge },
];

function TechnicalEvidencePage() {
  const overallReadiness = Math.round(
    disciplines.reduce((sum, item) => sum + item.readiness, 0) / disciplines.length,
  );

  return (
    <AppShell>
      <PageHeader
        title="الأدلة الفنية"
        description="صفحة مخصصة لربط تقارير السباكة والتكييف والإضاءة بالمشروع ومسار الاعتماد والتسليم"
        actions={
          <>
            <Button variant="outline">
              <Upload className="ms-1 h-4 w-4" /> رفع تقرير
            </Button>
            <Button>
              <ClipboardCheck className="ms-1 h-4 w-4" /> طلب مراجعة
            </Button>
          </>
        }
      />

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="relative overflow-hidden p-6 shadow-card">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--color-primary)/12,transparent_35%),radial-gradient(circle_at_bottom_right,var(--color-accent)/10,transparent_30%)]" />
          <div className="relative">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/25" variant="outline">
              Technical Evidence Layer
            </Badge>
            <h2 className="text-2xl font-black md:text-3xl">من التقرير الفني إلى قرار الاعتماد</h2>
            <p className="mt-3 max-w-3xl leading-8 text-muted-foreground">
              هذه الصفحة تجمع مخرجات برامج الحسابات الفنية مثل HAP وDIALux وأنظمة السباكة، ثم تربط كل تقرير بالمشروع والتخصص والإصدار وحالة المراجعة.
            </p>
            <div className="mt-5 max-w-xl">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-bold">الجاهزية العامة</span>
                <span className="font-black text-primary">{overallReadiness}%</span>
              </div>
              <Progress value={overallReadiness} className="h-2" />
            </div>
          </div>
        </Card>

        <Card className="p-5 shadow-card">
          <h3 className="mb-4 font-bold">ملخص سريع</h3>
          <div className="grid grid-cols-2 gap-3">
            {summaryCards.map((item) => (
              <div key={item.label} className="rounded-xl border border-border bg-muted/25 p-4">
                <item.icon className="mb-3 h-5 w-5 text-primary" />
                <div className="text-2xl font-black tabular-nums">{item.value}</div>
                <div className="text-xs text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-3">
        {disciplines.map((discipline) => {
          const Icon = discipline.icon;
          const meta = statusMeta[discipline.status];
          return (
            <Card key={discipline.key} className="flex flex-col p-5 shadow-card">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${discipline.colorClass}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <Badge variant="outline" className={meta.className}>{meta.label}</Badge>
              </div>

              <h3 className="text-xl font-black">{discipline.title}</h3>
              <p className="mt-2 min-h-14 text-sm leading-7 text-muted-foreground">{discipline.subtitle}</p>

              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-bold">جاهزية الطبقة</span>
                  <span className="font-black text-primary">{discipline.readiness}%</span>
                </div>
                <Progress value={discipline.readiness} className="h-2" />
              </div>

              <div className="mt-5 space-y-4 text-sm">
                <EvidenceList title="الأدوات / المخرجات المصدرية" items={discipline.software} />
                <EvidenceList title="المدخلات المطلوبة" items={discipline.requiredInputs} />
                <EvidenceList title="المخرجات المطلوبة" items={discipline.outputs} />
              </div>

              <div className="mt-5 rounded-xl border border-warning/25 bg-warning/10 p-3">
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-warning-foreground">
                  <AlertTriangle className="h-4 w-4" /> بنود مفتوحة
                </div>
                <ul className="space-y-1 text-xs leading-6 text-muted-foreground">
                  {discipline.openItems.map((item) => <li key={item}>• {item}</li>)}
                </ul>
              </div>
            </Card>
          );
        })}
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="p-5">
          <h3 className="mb-4 font-bold">مسار العمل القياسي</h3>
          <div className="space-y-3">
            {workflow.map((step, index) => (
              <div key={step.title} className="flex gap-3 rounded-xl border border-border bg-card p-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-xs font-black text-primary-foreground">
                  {index + 1}
                </div>
                <div>
                  <div className="font-bold">{step.title}</div>
                  <div className="text-xs leading-6 text-muted-foreground">{step.description}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold">قالب سجل التقرير الفني</h3>
              <p className="text-xs text-muted-foreground">الحقول التي يجب تثبيتها في قاعدة البيانات لاحقًا</p>
            </div>
            <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              "Project Code",
              "Discipline",
              "Evidence Type",
              "Source Software",
              "Report Version",
              "Prepared By",
              "Reviewed By",
              "Approval Status",
              "Linked Files",
              "Decision Notes",
            ].map((field) => (
              <div key={field} className="rounded-xl border border-border bg-muted/25 p-3 text-sm font-semibold">
                {field}
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-success/25 bg-success/10 p-3 text-sm leading-7 text-success">
            <CheckCircle2 className="ms-2 inline h-4 w-4" />
            هذه الصفحة الآن جاهزة كواجهة أولية. المرحلة التالية هي إنشاء جداول Supabase وربط رفع الملفات وحالات الاعتماد.
          </div>
        </Card>
      </section>
    </AppShell>
  );
}

function EvidenceList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="mb-2 text-xs font-black text-muted-foreground">{title}</div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <Badge key={item} variant="secondary" className="rounded-md text-[11px]">
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}
