import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Search, Shield } from "lucide-react";
import { members, type Member } from "@/lib/mock-data";

export const Route = createFileRoute("/members")({
  head: () => ({ meta: [{ title: "الأعضاء والصلاحيات — bim.alazab.com" }] }),
  component: MembersPage,
});

const roleTone: Record<Member["role"], string> = {
  Admin: "bg-destructive/15 text-destructive border-destructive/30",
  Owner: "bg-primary/15 text-primary border-primary/30",
  Editor: "bg-info/15 text-info border-info/30",
  Viewer: "bg-muted text-muted-foreground border-border",
};
const statusLabel: Record<Member["status"], string> = { active: "نشط", invited: "مدعو", suspended: "موقوف" };

function MembersPage() {
  return (
    <AppShell>
      <PageHeader
        title="الأعضاء والصلاحيات"
        description="إدارة فريق العمل، الأدوار، ومستويات الوصول"
        actions={<Button><UserPlus className="ms-1 h-4 w-4" /> دعوة عضو</Button>}
      />

      <Card className="mb-4 p-6">
        <h3 className="mb-3 flex items-center gap-2 font-semibold"><UserPlus className="h-4 w-4 text-primary" /> دعوة جديدة</h3>
        <div className="grid gap-3 md:grid-cols-[1fr_180px_180px_auto]">
          <Input placeholder="البريد الإلكتروني" />
          <Select defaultValue="Editor"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
            <SelectItem value="Admin">Admin — صلاحيات كاملة</SelectItem>
            <SelectItem value="Owner">Owner — مالك مشروع</SelectItem>
            <SelectItem value="Editor">Editor — تعديل</SelectItem>
            <SelectItem value="Viewer">Viewer — قراءة فقط</SelectItem>
          </SelectContent></Select>
          <Select defaultValue="all"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
            <SelectItem value="all">كل المشاريع</SelectItem>
            <SelectItem value="p1">برج العزب التجاري</SelectItem>
            <SelectItem value="p2">مجمع الواحة السكني</SelectItem>
          </SelectContent></Select>
          <Button>إرسال الدعوة</Button>
        </div>
      </Card>

      <Card className="mb-4 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="بحث بالاسم أو البريد..." className="pr-9" />
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-right text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">العضو</th>
                <th className="px-4 py-3 font-medium">الدور</th>
                <th className="px-4 py-3 font-medium">المشاريع</th>
                <th className="px-4 py-3 font-medium">الحالة</th>
                <th className="px-4 py-3 font-medium">تاريخ الانضمام</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9"><AvatarFallback className="bg-primary text-primary-foreground text-xs">{m.name.split(" ").slice(-1)[0].slice(0,2)}</AvatarFallback></Avatar>
                      <div><div className="font-medium">{m.name}</div><div className="text-xs text-muted-foreground">{m.email}</div></div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge variant="outline" className={roleTone[m.role]}><Shield className="ms-1 h-3 w-3" /> {m.role}</Badge></td>
                  <td className="px-4 py-3">{m.projects}</td>
                  <td className="px-4 py-3"><Badge variant="secondary">{statusLabel[m.status]}</Badge></td>
                  <td className="px-4 py-3 text-muted-foreground">{m.joinedAt}</td>
                  <td className="px-4 py-3"><Button size="sm" variant="ghost">إدارة</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
