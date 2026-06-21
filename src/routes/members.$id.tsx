import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell, PageHeader, StatusBadge } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Mail, Calendar, FolderKanban, Shield, MessageSquare } from "lucide-react";
import { members } from "@/lib/mock-data";

const roleTone = {
  Admin: "bg-destructive/15 text-destructive border border-destructive/30",
  Owner: "bg-primary/15 text-primary border border-primary/30",
  Editor: "bg-info/15 text-info border border-info/30",
  Viewer: "bg-muted text-muted-foreground border border-border",
} as const;
const statusTone = {
  active: "bg-success/15 text-success border border-success/30",
  invited: "bg-warning/15 text-warning-foreground border border-warning/30",
  suspended: "bg-destructive/15 text-destructive border border-destructive/30",
} as const;
const statusLabel = { active: "نشِط", invited: "مدعو", suspended: "موقوف" } as const;

export const Route = createFileRoute("/members/$id")({
  head: ({ params }) => ({ meta: [{ title: `عضو ${params.id} — bim.alazab.com` }] }),
  component: MemberDetail,
  notFoundComponent: () => (
    <AppShell><PageHeader title="غير موجود" description="العضو المطلوب غير موجود." actions={<Button asChild variant="outline"><Link to="/members"><ArrowRight className="ms-1 h-4 w-4" /> الأعضاء</Link></Button>} /></AppShell>
  ),
});

function MemberDetail() {
  const { id } = Route.useParams();
  const m = members.find((x) => x.id === id);
  if (!m) throw notFound();
  const initials = m.name.split(" ").slice(-1)[0].slice(0, 2);
  return (
    <AppShell>
      <PageHeader
        title={m.name}
        description={m.email}
        badge={<StatusBadge tone={statusTone[m.status]}>{statusLabel[m.status]}</StatusBadge>}
        actions={
          <>
            <Button asChild variant="outline"><Link to="/members"><ArrowRight className="ms-1 h-4 w-4" /> العودة</Link></Button>
            <Button><MessageSquare className="ms-1 h-4 w-4" /> مراسلة</Button>
          </>
        }
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20"><AvatarFallback className="bg-primary text-2xl text-primary-foreground">{initials}</AvatarFallback></Avatar>
            <div>
              <div className="text-xl font-bold">{m.name}</div>
              <Badge variant="outline" className={roleTone[m.role]}>{m.role}</Badge>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Info icon={Mail} label="البريد الإلكتروني" value={m.email} />
            <Info icon={Shield} label="الدور" value={m.role} />
            <Info icon={FolderKanban} label="عدد المشاريع" value={String(m.projects)} />
            <Info icon={Calendar} label="تاريخ الانضمام" value={m.joinedAt} />
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="mb-4 font-semibold">الصلاحيات</h3>
          <ul className="space-y-2 text-sm">
            {["عرض المشاريع", "تعديل الملفات", "إنشاء قضايا", "اعتماد إصدارات", "إدارة الأعضاء"].map((perm, i) => {
              const allowed = m.role === "Admin" || m.role === "Owner" || (m.role === "Editor" && i < 3) || (m.role === "Viewer" && i === 0);
              return <li key={perm} className="flex items-center justify-between"><span>{perm}</span><Badge variant={allowed ? "default" : "outline"} className={allowed ? "" : "text-muted-foreground"}>{allowed ? "مفعّل" : "—"}</Badge></li>;
            })}
          </ul>
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
