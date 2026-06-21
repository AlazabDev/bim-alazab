import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell, PageHeader, StatusBadge } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, CheckCircle2, XCircle, Clock, User2, Briefcase, Send } from "lucide-react";
import { approvals } from "@/lib/mock-data";

const statusMeta = {
  approved: { label: "معتمد", tone: "bg-success/15 text-success border border-success/30", icon: CheckCircle2 },
  pending: { label: "قيد المراجعة", tone: "bg-warning/15 text-warning-foreground border border-warning/30", icon: Clock },
  rejected: { label: "مرفوض", tone: "bg-destructive/15 text-destructive border border-destructive/30", icon: XCircle },
  waiting: { label: "بالانتظار", tone: "bg-muted text-muted-foreground border border-border", icon: Clock },
} as const;

export const Route = createFileRoute("/approvals/$id")({
  head: ({ params }) => ({ meta: [{ title: `موافقة ${params.id} — bim.alazab.com` }] }),
  component: ApprovalDetail,
  notFoundComponent: () => (
    <AppShell><PageHeader title="غير موجودة" description="الموافقة المطلوبة غير موجودة." actions={<Button asChild variant="outline"><Link to="/approvals"><ArrowRight className="ms-1 h-4 w-4" /> الموافقات</Link></Button>} /></AppShell>
  ),
});

function ApprovalDetail() {
  const { id } = Route.useParams();
  const idx = Number.parseInt(id.replace(/^a/, ""), 10);
  const item = approvals[Number.isFinite(idx) ? idx : 0];
  if (!item) throw notFound();
  const meta = statusMeta[item.status];
  const Icon = meta.icon;
  return (
    <AppShell>
      <PageHeader
        title={item.step}
        description={`${item.role} — ${item.user}`}
        badge={<StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>}
        actions={<Button asChild variant="outline"><Link to="/approvals"><ArrowRight className="ms-1 h-4 w-4" /> العودة</Link></Button>}
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <h3 className="mb-3 flex items-center gap-2 font-semibold"><Icon className="h-5 w-5" /> تفاصيل خطوة الموافقة</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{item.comment ?? "لا توجد تعليقات بعد."}</p>
          {item.date && <div className="mt-3 text-xs text-muted-foreground">آخر تحديث: {item.date}</div>}
          <div className="mt-6">
            <h4 className="mb-2 text-sm font-semibold">إضافة ملاحظة</h4>
            <Textarea placeholder="اكتب ملاحظتك..." rows={4} />
            <div className="mt-2 flex justify-end gap-2">
              {item.status === "pending" && <>
                <Button variant="outline" className="text-destructive"><XCircle className="ms-1 h-4 w-4" /> رفض</Button>
                <Button><CheckCircle2 className="ms-1 h-4 w-4" /> اعتماد</Button>
              </>}
              {item.status !== "pending" && <Button><Send className="ms-1 h-4 w-4" /> إرسال</Button>}
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="mb-4 font-semibold">معلومات</h3>
          <div className="space-y-3 text-sm">
            <Info icon={User2} label="المُسؤول" value={item.user} />
            <Info icon={Briefcase} label="الدور" value={item.role} />
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
