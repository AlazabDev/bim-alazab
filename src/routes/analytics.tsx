import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileBarChart, Sparkles } from "lucide-react";
import { kpis, progressTrend, conformityTrend } from "@/lib/mock-data";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from "recharts";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "التحليلات والتقارير — bim.alazab.com" }] }),
  component: AnalyticsPage,
});

const status = [
  { name: "قيد التنفيذ", value: 7, color: "var(--color-info)" },
  { name: "قيد المراجعة", value: 3, color: "var(--color-warning)" },
  { name: "معتمد", value: 2, color: "var(--color-success)" },
];

const recos = [
  { t: "تقليل زمن الموافقة بـ 32%", d: "إعادة توزيع مراجعي طبقة الإشراف على المشاريع النشطة." },
  { t: "تركيز على واجهة الطابق 12", d: "كشف AI تكرار 4 انحرافات هندسية بنفس المنطقة الأسبوع الحالي." },
  { t: "أرشفة 18 ملفًا قديمًا", d: "ملفات بإصدارات سابقة لم تُستخدم منذ 90 يومًا." },
];

function AnalyticsPage() {
  return (
    <AppShell>
      <PageHeader
        title="التحليلات ولوحات القيادة"
        description="مؤشرات أداء، تحليل النتائج، وتوصيات ذكية قابلة للتصدير"
        actions={<Button><Download className="ms-1 h-4 w-4" /> تصدير PDF</Button>}
      />

      <div className="grid gap-3 md:grid-cols-4">
        {[
          ["نسبة الإنجاز العامة", "68%"],
          ["نسبة المطابقة", `${kpis.avgConformity}%`],
          ["عدد الملفات", kpis.filesUploaded],
          ["قضايا مفتوحة", kpis.openIssues],
        ].map(([l, v]) => (
          <Card key={l} className="p-4">
            <div className="text-xs text-muted-foreground">{l}</div>
            <div className="mt-1 text-2xl font-bold">{v}</div>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h3 className="mb-3 font-semibold">المخطط مقابل الفعلي</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={progressTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
              <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
              <Legend />
              <Area name="المخطط" type="monotone" dataKey="planned" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.2} />
              <Area name="الفعلي" type="monotone" dataKey="actual" stroke="var(--color-chart-2)" fill="var(--color-chart-2)" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5">
          <h3 className="mb-3 font-semibold">توزيع المشاريع</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={status} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>
                {status.map((s, i) => <Cell key={i} fill={s.color} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-3 font-semibold">المطابقة الأسبوعية</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={conformityTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="week" stroke="var(--color-muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
              <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
              <Bar dataKey="value" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="mb-3 flex items-center gap-2 font-semibold"><Sparkles className="h-4 w-4 text-primary" /> توصيات وتحسينات تلقائية</h3>
          <div className="space-y-3">
            {recos.map((r) => (
              <div key={r.t} className="rounded-lg border border-border bg-accent/30 p-3">
                <div className="text-sm font-semibold">{r.t}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{r.d}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-4 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><FileBarChart className="h-5 w-5 text-primary" /><div><div className="font-semibold">تقرير تنفيذي شهري</div><div className="text-xs text-muted-foreground">يجمع KPIs، الموافقات، الانحرافات، والتوصيات</div></div></div>
          <Button><Download className="ms-1 h-4 w-4" /> توليد PDF</Button>
        </div>
      </Card>
    </AppShell>
  );
}
