import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell, PageHeader, StatusBadge } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, AlertTriangle, MessageSquare, Send, Calendar, User2, FolderKanban } from "lucide-react";
import { issues, type Issue } from "@/lib/mock-data";

const priorityTone: Record<Issue["priority"], string> = {
  critical: "bg-destructive/15 text-destructive border border-destructive/30",
  high: "bg-warning/15 text-warning-foreground border border-warning/30",
  medium: "bg-info/15 text-info border border-info/30",
  low: "bg-muted text-muted-foreground border border-border",
};
const priorityLabel: Record<Issue["priority"], string> = { critical: "حرج", high: "عالي", medium: "متوسط", low: "منخفض" };
const statusTone: Record<Issue["status"], string> = {
  open: "bg-destructive/15 text-destructive border border-destructive/30",
  in_progress: "bg-warning/15 text-warning-foreground border border-warning/30",
  resolved: "bg-success/15 text-success border border-success/30",
  closed: "bg-muted text-muted-foreground border border-border",
};
const statusLabel: Record<Issue["status"], string> = { open: "مفتوح", in_progress: "قيد العمل", resolved: "محلول", closed: "مغلق" };

const kindMeta = {
  issue: { back: "/issues" as const, label: "القضايا" },
  rfi: { back: "/rfis" as const, label: "طلبات المعلومات" },
  submittal: { back: "/submittals" as const, label: "المعتمدات" },
};

export function IssueDetail({ id, kind }: { id: string; kind: Issue["type"] }) {
  const item = issues.find((i) => i.id === id && i.type === kind);
  if (!item) throw notFound();
  const meta = kindMeta[kind];
  return (
    <AppShell>
      <PageHeader
        title={item.title}
        description={`${item.code} • ${item.project}`}
        badge={<StatusBadge tone={statusTone[item.status]}>{statusLabel[item.status]}</StatusBadge>}
        actions={<Button asChild variant="outline"><Link to={meta.back}><ArrowRight className="ms-1 h-4 w-4" /> العودة إلى {meta.label}</Link></Button>}
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <h3 className="mb-3 flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4 text-warning" /> الوصف</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            تفاصيل {meta.label.slice(0, -1)} «{item.title}» على مشروع {item.project}. تم تسجيلها بواسطة {item.assignee} وهي حالياً بحالة {statusLabel[item.status]} بأولوية {priorityLabel[item.priority]}.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Info icon={User2} label="المسؤول" value={item.assignee} />
            <Info icon={FolderKanban} label="المشروع" value={item.project} />
            <Info icon={Calendar} label="تاريخ الإنشاء" value={item.createdAt} />
            <Info icon={AlertTriangle} label="الأولوية" value={priorityLabel[item.priority]} />
          </div>
          <div className="mt-6">
            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold"><MessageSquare className="h-4 w-4" /> إضافة تعليق</h4>
            <Textarea placeholder="اكتب تعليقاً أو تحديثاً..." rows={4} />
            <div className="mt-2 flex justify-end gap-2"><Button variant="outline">حفظ</Button><Button><Send className="ms-1 h-4 w-4" /> إرسال</Button></div>
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="mb-4 font-semibold">معلومات</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between"><span className="text-muted-foreground">الكود</span><Badge variant="outline">{item.code}</Badge></div>
            <div className="flex items-center justify-between"><span className="text-muted-foreground">النوع</span><Badge variant="secondary">{meta.label}</Badge></div>
            <div className="flex items-center justify-between"><span className="text-muted-foreground">الأولوية</span><Badge variant="outline" className={priorityTone[item.priority]}>{priorityLabel[item.priority]}</Badge></div>
            <div className="flex items-center justify-between"><span className="text-muted-foreground">الحالة</span><Badge variant="outline" className={statusTone[item.status]}>{statusLabel[item.status]}</Badge></div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function Info({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
      <div><div className="text-xs text-muted-foreground">{label}</div><div className="font-medium">{value}</div></div>
    </div>
  );
}

export const Route = createFileRoute("/issues/$id")({
  head: ({ params }) => ({ meta: [{ title: `قضية ${params.id} — bim.alazab.com` }] }),
  component: () => {
    const { id } = Route.useParams();
    return <IssueDetail id={id} kind="issue" />;
  },
  notFoundComponent: () => (
    <AppShell><PageHeader title="غير موجودة" description="القضية المطلوبة غير موجودة." actions={<Button asChild variant="outline"><Link to="/issues"><ArrowRight className="ms-1 h-4 w-4" /> القضايا</Link></Button>} /></AppShell>
  ),
});
