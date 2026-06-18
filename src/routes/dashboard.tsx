import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, PageHeader, StatusBadge } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  FolderKanban, FileStack, MessageSquare, CheckCircle2, TrendingUp, AlertTriangle, Plus,
  ArrowUpRight, ImageIcon
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from "recharts";
import { kpis, projects, activity, statusMeta, progressTrend, conformityTrend, fieldImages } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "لوحة القيادة — bim.alazab.com" }] }),
  component: DashboardPage,
});

const tiles = [
  { label: "إجمالي المشاريع", value: kpis.totalProjects, icon: FolderKanban, tone: "text-info bg-info/10" },
  { label: "مشاريع نشطة", value: kpis.activeProjects, icon: TrendingUp, tone: "text-primary bg-primary/10" },
  { label: "ملفات مرفوعة", value: kpis.filesUploaded, icon: FileStack, tone: "text-chart-5 bg-chart-5/10" },
  { label: "قضايا مفتوحة", value: kpis.openIssues, icon: AlertTriangle, tone: "text-destructive bg-destructive/10" },
  { label: "متوسط المطابقة", value: `${kpis.avgConformity}%`, icon: CheckCircle2, tone: "text-success bg-success/10" },
  { label: "موافقات معلقة", value: kpis.pendingApprovals, icon: MessageSquare, tone: "text-warning bg-warning/10" },
];

function DashboardPage() {
  return (
    <AppShell>
      <PageHeader
        title="لوحة القيادة التنفيذية"
        description="نظرة شاملة على المشاريع، الملفات، والمؤشرات الحيوية"
        actions={
          <>
            <Button variant="outline">تصدير PDF</Button>
            <Button asChild><Link to="/projects/new"><Plus className="ms-1 h-4 w-4" /> مشروع جديد</Link></Button>
          </>
        }
      />

      {/* KPI tiles */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {tiles.map((t) => (
          <Card key={t.label} className="p-4 shadow-card">
            <div className="flex items-center justify-between">
              <div className={`grid h-9 w-9 place-items-center rounded-lg ${t.tone}`}><t.icon className="h-4 w-4" /></div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-3 text-2xl font-bold">{t.value}</div>
            <div className="text-xs text-muted-foreground">{t.label}</div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">تقدم الإنجاز — المخطط مقابل الفعلي</h3>
              <p className="text-xs text-muted-foreground">آخر 6 أشهر</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={progressTrend}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
              <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
              <Legend />
              <Area name="المخطط" type="monotone" dataKey="planned" stroke="var(--color-primary)" fill="url(#g1)" strokeWidth={2} />
              <Area name="الفعلي" type="monotone" dataKey="actual" stroke="var(--color-chart-2)" fill="url(#g2)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="mb-1 font-semibold">معدل المطابقة الأسبوعي</h3>
          <p className="mb-3 text-xs text-muted-foreground">تحليل AI للصور الميدانية</p>
          <ResponsiveContainer width="100%" height={260}>
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

      {/* Projects + activity */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">المشاريع النشطة</h3>
            <Button asChild variant="ghost" size="sm"><Link to="/projects">عرض الكل</Link></Button>
          </div>
          <div className="space-y-3">
            {projects.slice(0, 4).map((p) => {
              const meta = statusMeta[p.status];
              return (
                <Link key={p.id} to="/projects/$id" params={{ id: p.id }} className="block">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-lg border border-border bg-card p-4 transition hover:shadow-card">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate font-semibold">{p.name}</span>
                        <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">{p.code} • {p.client} • {p.location}</div>
                      <div className="mt-3 flex items-center gap-3">
                        <Progress value={p.progress} className="h-1.5 flex-1" />
                        <span className="text-xs font-medium tabular-nums">{p.progress}%</span>
                      </div>
                    </div>
                    <div className="hidden text-right md:block">
                      <div className="text-xs text-muted-foreground">المطابقة</div>
                      <div className="text-lg font-bold text-success">{p.conformity}%</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 font-semibold">آخر النشاطات</h3>
          <ol className="relative space-y-4 border-r border-dashed border-border pr-4">
            {activity.map((a) => (
              <li key={a.id} className="relative">
                <span className="absolute -right-[21px] top-1 h-3 w-3 rounded-full border-2 border-background bg-primary" />
                <div className="text-sm"><span className="font-medium">{a.user}</span> <span className="text-muted-foreground">{a.action}</span> <span className="font-medium">{a.target}</span></div>
                <div className="text-[11px] text-muted-foreground">{a.time}</div>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      {/* AI field images */}
      <Card className="mt-4 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold flex items-center gap-2"><ImageIcon className="h-4 w-4" /> آخر تحليلات الذكاء الاصطناعي للموقع</h3>
            <p className="text-xs text-muted-foreground">مقارنة الصور الميدانية مع التصميم المعتمد</p>
          </div>
          <Button asChild variant="outline" size="sm"><Link to="/field-analysis">عرض التفاصيل</Link></Button>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {fieldImages.map((img) => (
            <div key={img.id} className="overflow-hidden rounded-lg border border-border bg-card">
              <div className="relative aspect-video bg-gradient-to-br from-muted to-accent">
                <div className="absolute inset-0 grid place-items-center text-muted-foreground"><ImageIcon className="h-8 w-8" /></div>
                <span className={`absolute right-2 top-2 rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                  img.status === "conform" ? "bg-success text-success-foreground" :
                  img.status === "deviation" ? "bg-destructive text-destructive-foreground" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {img.status === "conform" ? "مطابق" : img.status === "deviation" ? "انحراف" : "قيد التحليل"}
                </span>
              </div>
              <div className="p-3">
                <div className="truncate text-sm font-semibold">{img.title}</div>
                <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{img.location}</span>
                  <span>{img.uploadedAt}</span>
                </div>
                {img.status !== "analyzing" && (
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs">المطابقة</span>
                    <span className={`text-sm font-bold ${img.conformity > 90 ? "text-success" : "text-warning"}`}>{img.conformity}%</span>
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
