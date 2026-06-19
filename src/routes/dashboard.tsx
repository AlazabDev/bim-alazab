import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, PageHeader, StatusBadge } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  FileQuestion,
  FileStack,
  FolderKanban,
  ImageIcon,
  Layers3,
  MessageSquare,
  Plus,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  activity,
  conformityTrend,
  fieldImages,
  kpis,
  progressTrend,
  projects,
  statusMeta,
} from "@/lib/mock-data";
import { useQuery } from "@tanstack/react-query";
import { fetchTechnicalEvidence } from "@/lib/technical-evidence-api";


export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "مركز تحكم BIM — Alazab BIM" }] }),
  component: DashboardPage,
});

const tiles = [
  { label: "إجمالي المشاريع", value: kpis.totalProjects, icon: FolderKanban, tone: "text-info bg-info/10", to: "/projects" },
  { label: "مشاريع نشطة", value: kpis.activeProjects, icon: TrendingUp, tone: "text-primary bg-primary/10", to: "/projects" },
  { label: "ملفات مرفوعة", value: kpis.filesUploaded, icon: FileStack, tone: "text-chart-5 bg-chart-5/10", to: "/files" },
  { label: "قضايا مفتوحة", value: kpis.openIssues, icon: AlertTriangle, tone: "text-destructive bg-destructive/10", to: "/issues" },
  { label: "متوسط المطابقة", value: `${kpis.avgConformity}%`, icon: CheckCircle2, tone: "text-success bg-success/10", to: "/field-analysis" },
  { label: "موافقات معلقة", value: kpis.pendingApprovals, icon: MessageSquare, tone: "text-warning bg-warning/10", to: "/approvals" },
] as const;

const commandFlow = [
  { label: "Project", description: "تحديد المشروع والفرع والعميل", status: "مفعل" },
  { label: "Discipline", description: "معماري، إنشائي، MEP، سباكة، إضاءة", status: "مفعل" },
  { label: "Record", description: "ملف، صورة، تقرير، RFI، Issue، Submittal", status: "مفعل" },
  { label: "Revision", description: "تتبع الإصدار والتاريخ والمسؤول", status: "قادم" },
  { label: "Decision", description: "اعتماد، رفض، تعليق، أو تصعيد", status: "قادم" },
];

// evidence readiness is computed from live data inside the component


const botActions = [
  { title: "متابعة حالة مشروع", to: "/projects", icon: FolderKanban },
  { title: "البحث عن ملف", to: "/files", icon: FileStack },
  { title: "إنشاء Issue", to: "/issues", icon: AlertTriangle },
  { title: "إنشاء RFI", to: "/rfis", icon: FileQuestion },
  { title: "إنشاء Submittal", to: "/submittals", icon: FileCheck2 },
  { title: "مراجعة تسليم", to: "/approvals", icon: ClipboardCheck },
] as const;

function DashboardPage() {
  return (
    <AppShell>
      <PageHeader
        title="مركز تحكم BIM"
        description="لوحة تشغيلية لإدارة معلومات المشروع، الملفات، الاعتمادات، الملاحظات، والأدلة الفنية"
        badge={<StatusBadge tone="bg-primary/10 text-primary border-primary/25">Project Information Management</StatusBadge>}
        actions={
          <>
            <Button variant="outline">تصدير تقرير</Button>
            <Button asChild>
              <Link to="/projects/new">
                <Plus className="ms-1 h-4 w-4" /> مشروع جديد
              </Link>
            </Button>
          </>
        }
      />

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="relative overflow-hidden p-6 shadow-card">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--color-primary)/12,transparent_35%),radial-gradient(circle_at_bottom_right,var(--color-accent)/10,transparent_30%)]" />
          <div className="relative grid gap-6 lg:grid-cols-[1fr_auto]">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                <ShieldCheck className="h-4 w-4" />
                BIM governance layer
              </div>
              <h2 className="text-2xl font-black md:text-3xl">إدارة المشروع من الملف إلى القرار</h2>
              <p className="mt-3 max-w-2xl leading-8 text-muted-foreground">
                الهدف هو ربط كل ملف أو تقرير أو صورة أو ملاحظة بحالة واضحة داخل المشروع، ثم تحويلها إلى قرار قابل للتتبع: اعتماد، تعليق، تصعيد، أو تسليم.
              </p>
            </div>
            <div className="grid min-w-56 gap-2 rounded-2xl border border-border bg-card/75 p-4 backdrop-blur">
              <div className="text-xs font-bold text-muted-foreground">BIMBot readiness</div>
              <div className="text-4xl font-black text-primary">72%</div>
              <Progress value={72} className="h-2" />
              <div className="text-xs text-muted-foreground">جاهزية أولية لمسارات الحالة والملفات والاعتمادات</div>
            </div>
          </div>
        </Card>

        <Card className="p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold">مسار القرار</h3>
              <p className="text-xs text-muted-foreground">Project → Decision</p>
            </div>
            <Layers3 className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-2">
            {commandFlow.map((step, index) => (
              <div key={step.label} className="flex items-center gap-3 rounded-xl border border-border bg-muted/25 p-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-xs font-black text-primary-foreground">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold">{step.label}</div>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">{step.status}</span>
                  </div>
                  <div className="truncate text-xs text-muted-foreground">{step.description}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {tiles.map((t) => (
          <Link key={t.label} to={t.to} className="block">
            <Card className="h-full p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-elevated">
              <div className="flex items-center justify-between">
                <div className={`grid h-9 w-9 place-items-center rounded-lg ${t.tone}`}>
                  <t.icon className="h-4 w-4" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-3 text-2xl font-black tabular-nums">{t.value}</div>
              <div className="text-xs text-muted-foreground">{t.label}</div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold">تقدم الإنجاز — المخطط مقابل الفعلي</h3>
              <p className="text-xs text-muted-foreground">مؤشر تحكم للمشاريع النشطة خلال آخر 6 أشهر</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={270}>
            <AreaChart data={progressTrend}>
              <defs>
                <linearGradient id="plannedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
              <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
              <Legend />
              <Area name="المخطط" type="monotone" dataKey="planned" stroke="var(--color-primary)" fill="url(#plannedGradient)" strokeWidth={2} />
              <Area name="الفعلي" type="monotone" dataKey="actual" stroke="var(--color-chart-2)" fill="url(#actualGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="mb-1 font-bold">معدل المطابقة الأسبوعي</h3>
          <p className="mb-3 text-xs text-muted-foreground">تحليل الصور الميدانية مقابل التصميم المعتمد</p>
          <ResponsiveContainer width="100%" height={270}>
            <BarChart data={conformityTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="week" stroke="var(--color-muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
              <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
              <Bar dataKey="value" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold">المشاريع النشطة</h3>
              <p className="text-xs text-muted-foreground">متابعة مباشرة للحالة، المطابقة، والملفات</p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/projects">عرض الكل</Link>
            </Button>
          </div>
          <div className="space-y-3">
            {projects.slice(0, 4).map((project) => {
              const meta = statusMeta[project.status];
              return (
                <Link key={project.id} to="/projects/$id" params={{ id: project.id }} className="block">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-xl border border-border bg-card p-4 transition hover:shadow-card">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate font-bold">{project.name}</span>
                        <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {project.code} • {project.client} • {project.location}
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        <Progress value={project.progress} className="h-1.5 flex-1" />
                        <span className="text-xs font-bold tabular-nums">{project.progress}%</span>
                      </div>
                    </div>
                    <div className="hidden min-w-28 text-right md:block">
                      <div className="text-xs text-muted-foreground">المطابقة</div>
                      <div className="text-lg font-black text-success">{project.conformity}%</div>
                      <div className="text-[11px] text-muted-foreground">{project.filesCount} ملف</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-bold">إجراءات BIMBot الأولية</h3>
              <p className="text-xs text-muted-foreground">مسارات جاهزة للتحويل لاحقًا إلى أوامر وكيل</p>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {botActions.map((action) => (
              <Link key={action.title} to={action.to} className="rounded-xl border border-border p-3 transition hover:bg-muted/40">
                <action.icon className="mb-2 h-5 w-5 text-primary" />
                <div className="text-sm font-bold">{action.title}</div>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold">جاهزية طبقة الأدلة الفنية</h3>
              <p className="text-xs text-muted-foreground">تمهيد لربط HVAC وLighting وPlumbing داخل مسار BIM</p>
            </div>
            <FileCheck2 className="h-5 w-5 text-primary" />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {evidenceReadiness.map((item) => (
              <div key={item.label} className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="font-bold">{item.label}</div>
                  <div className="text-sm font-black text-primary">{item.value}%</div>
                </div>
                <Progress value={item.value} className="h-2" />
                <div className="mt-2 text-xs text-muted-foreground">{item.note}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <h3 className="font-bold">آخر النشاطات</h3>
          </div>
          <ol className="relative space-y-4 border-r border-dashed border-border pr-4">
            {activity.map((entry) => (
              <li key={entry.id} className="relative">
                <span className="absolute -right-[21px] top-1 h-3 w-3 rounded-full border-2 border-background bg-primary" />
                <div className="text-sm">
                  <span className="font-bold">{entry.user}</span> <span className="text-muted-foreground">{entry.action}</span> <span className="font-semibold">{entry.target}</span>
                </div>
                <div className="text-[11px] text-muted-foreground">{entry.time}</div>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <Card className="mt-4 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="flex items-center gap-2 font-bold">
              <ImageIcon className="h-4 w-4" /> آخر تحليلات الموقع
            </h3>
            <p className="text-xs text-muted-foreground">قراءة الصور الميدانية كمصدر Evidence داخل المشروع</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/field-analysis">عرض التفاصيل</Link>
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {fieldImages.map((image) => (
            <div key={image.id} className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="relative aspect-video bg-gradient-to-br from-muted to-accent">
                <div className="absolute inset-0 grid place-items-center text-muted-foreground">
                  <ImageIcon className="h-8 w-8" />
                </div>
                <span className={`absolute right-2 top-2 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                  image.status === "conform"
                    ? "bg-success text-success-foreground"
                    : image.status === "deviation"
                      ? "bg-destructive text-destructive-foreground"
                      : "bg-muted text-muted-foreground"
                }`}>
                  {image.status === "conform" ? "مطابق" : image.status === "deviation" ? "انحراف" : "قيد التحليل"}
                </span>
              </div>
              <div className="p-3">
                <div className="truncate text-sm font-bold">{image.title}</div>
                <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{image.location}</span>
                  <span>{image.uploadedAt}</span>
                </div>
                {image.status !== "analyzing" && (
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs">المطابقة</span>
                    <span className={`text-sm font-black ${image.conformity > 90 ? "text-success" : "text-warning"}`}>
                      {image.conformity}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
