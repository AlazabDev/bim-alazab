import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, AlertTriangle, MessageSquare, FileCheck2, FileQuestion } from "lucide-react";
import { issues, type Issue } from "@/lib/mock-data";

type Kind = Issue["type"];
const meta: Record<Kind, { title: string; desc: string; icon: any; cta: string }> = {
  issue: { title: "القضايا", desc: "ملاحظات ومشاكل التنفيذ والتعارضات", icon: AlertTriangle, cta: "قضية جديدة" },
  rfi: { title: "طلبات المعلومات (RFIs)", desc: "استفسارات رسمية تتطلب توضيحًا من المالك أو الاستشاري", icon: FileQuestion, cta: "RFI جديد" },
  submittal: { title: "المعتمدات (Submittals)", desc: "مواد وعينات تتطلب الاعتماد قبل التنفيذ", icon: FileCheck2, cta: "Submittal جديد" },
};

const priorityTone: Record<Issue["priority"], string> = {
  critical: "bg-destructive/15 text-destructive border-destructive/30",
  high: "bg-warning/15 text-warning-foreground border-warning/30",
  medium: "bg-info/15 text-info border-info/30",
  low: "bg-muted text-muted-foreground border-border",
};
const priorityLabel: Record<Issue["priority"], string> = { critical: "حرج", high: "عالي", medium: "متوسط", low: "منخفض" };
const statusLabel: Record<Issue["status"], string> = { open: "مفتوح", in_progress: "قيد العمل", resolved: "محلول", closed: "مغلق" };

export function IssuesList({ kind }: { kind: Kind }) {
  const m = meta[kind];
  const Icon = m.icon;
  const data = issues.filter((i) => i.type === kind);
  return (
    <AppShell>
      <PageHeader title={m.title} description={m.desc} actions={<Button><Plus className="ms-1 h-4 w-4" /> {m.cta}</Button>} />
      <Card className="mb-4 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="بحث..." className="pr-9" />
        </div>
      </Card>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-right text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">الكود</th>
                <th className="px-4 py-3 font-medium">العنوان</th>
                <th className="px-4 py-3 font-medium">المشروع</th>
                <th className="px-4 py-3 font-medium">المسؤول</th>
                <th className="px-4 py-3 font-medium">الأولوية</th>
                <th className="px-4 py-3 font-medium">الحالة</th>
                <th className="px-4 py-3 font-medium">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground"><Icon className="mx-auto h-10 w-10 opacity-40" /><div className="mt-2">لا توجد سجلات بعد</div><Button className="mt-3" size="sm">{m.cta}</Button></td></tr>
              ) : data.map((i) => (
                <tr key={i.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3"><Badge variant="outline">{i.code}</Badge></td>
                  <td className="px-4 py-3 font-medium">{i.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{i.project}</td>
                  <td className="px-4 py-3">{i.assignee}</td>
                  <td className="px-4 py-3"><Badge variant="outline" className={priorityTone[i.priority]}>{priorityLabel[i.priority]}</Badge></td>
                  <td className="px-4 py-3"><Badge variant="secondary">{statusLabel[i.status]}</Badge></td>
                  <td className="px-4 py-3 text-muted-foreground">{i.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}

export const Route = createFileRoute("/issues")({
  head: () => ({ meta: [{ title: "القضايا — bim.alazab.com" }] }),
  component: () => <IssuesList kind="issue" />,
});
