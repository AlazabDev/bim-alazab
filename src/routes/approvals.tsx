import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle, FileText } from "lucide-react";
import { projects, approvals, statusMeta } from "@/lib/mock-data";

export const Route = createFileRoute("/approvals")({
  head: () => ({ meta: [{ title: "الموافقات — bim.alazab.com" }] }),
  component: ApprovalsPage,
});

function ApprovalsPage() {
  return (
    <AppShell>
      <PageHeader title="مركز الموافقات الجماعية" description="تتبع كل مسار اعتماد: مهندس التصميم ← جهة الإشراف ← المالك" />

      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="بانتظار مراجعتي" value={4} tone="text-warning bg-warning/10" icon={Clock} />
        <Stat label="موافقات معتمدة" value={28} tone="text-success bg-success/10" icon={CheckCircle2} />
        <Stat label="موافقات مرفوضة" value={3} tone="text-destructive bg-destructive/10" icon={XCircle} />
      </div>

      <div className="mt-4 space-y-4">
        {projects.slice(0, 3).map((p) => {
          const meta = statusMeta[p.status];
          return (
            <Card key={p.id} className="p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /><span className="font-semibold">{p.name}</span><Badge variant="outline">{p.code}</Badge></div>
                  <div className="mt-1 text-xs text-muted-foreground">آخر تحديث: اليوم • {p.client}</div>
                </div>
                <Badge className={meta.tone} variant="outline">{meta.label}</Badge>
              </div>

              <ol className="grid gap-3 md:grid-cols-3">
                {approvals.map((a, i) => {
                  const Icon = a.status === "approved" ? CheckCircle2 : a.status === "rejected" ? XCircle : Clock;
                  const tone = a.status === "approved" ? "text-success bg-success/10 border-success/30" :
                               a.status === "rejected" ? "text-destructive bg-destructive/10 border-destructive/30" :
                               a.status === "pending" ? "text-warning bg-warning/10 border-warning/30" :
                               "text-muted-foreground bg-muted border-border";
                  return (
                    <li key={i} className={`rounded-lg border p-3 ${tone}`}>
                      <div className="flex items-center gap-2"><Icon className="h-4 w-4" /><span className="text-xs font-semibold">{i + 1}. {a.step}</span></div>
                      <div className="mt-1.5 text-xs opacity-80">{a.user}</div>
                      {a.status === "pending" && <Button size="sm" className="mt-3 w-full">مراجعة الآن</Button>}
                    </li>
                  );
                })}
              </ol>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}

function Stat({ label, value, tone, icon: Icon }: { label: string; value: number; tone: string; icon: any }) {
  return (
    <Card className="p-4">
      <div className={`grid h-9 w-9 place-items-center rounded-lg ${tone}`}><Icon className="h-4 w-4" /></div>
      <div className="mt-3 text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </Card>
  );
}
