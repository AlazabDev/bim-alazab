import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Upload, CheckCircle2, MessageCircle, Edit3, Plus, XCircle } from "lucide-react";
import { activity, type Activity } from "@/lib/mock-data";

export const Route = createFileRoute("/activity")({
  head: () => ({ meta: [{ title: "سجل النشاط — bim.alazab.com" }] }),
  component: ActivityPage,
});

const iconMap: Record<Activity["type"], { i: any; tone: string }> = {
  upload: { i: Upload, tone: "text-info bg-info/10" },
  approve: { i: CheckCircle2, tone: "text-success bg-success/10" },
  comment: { i: MessageCircle, tone: "text-muted-foreground bg-muted" },
  edit: { i: Edit3, tone: "text-warning bg-warning/10" },
  create: { i: Plus, tone: "text-primary bg-primary/10" },
  reject: { i: XCircle, tone: "text-destructive bg-destructive/10" },
};

function ActivityPage() {
  return (
    <AppShell>
      <PageHeader title="سجل النشاط والعمليات" description="تتبع زمني لكل عملية رفع، تعديل، أو اعتماد على المنصة" />
      <Card className="mb-4 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="بحث في السجل..." className="pr-9" />
        </div>
      </Card>
      <Card className="p-6">
        <ol className="relative space-y-5 border-r-2 border-dashed border-border pr-6">
          {[...activity, ...activity].map((a, i) => {
            const m = iconMap[a.type];
            const Icon = m.i;
            return (
              <li key={i} className="relative">
                <span className={`absolute -right-[34px] top-0 grid h-7 w-7 place-items-center rounded-full border-2 border-background ${m.tone}`}><Icon className="h-3.5 w-3.5" /></span>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{a.user}</span>
                  <Badge variant="outline" className="text-[10px]">{a.type}</Badge>
                  <span className="text-sm text-muted-foreground">{a.action} {a.target}</span>
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">{a.time} • IP 10.0.21.{i + 14} • Chrome/Mac</div>
              </li>
            );
          })}
        </ol>
      </Card>
    </AppShell>
  );
}
